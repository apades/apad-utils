import { isEqual, isObject, isUndefined, omit } from 'lodash-es'
import { AsyncLock } from '../src/AsyncLock'

type Option<T> = Partial<{
  /**不建议主动传入ver，只用传入特定的store就行 */
  ver?: number
  /**如果只是需要创建store不建议使用，推荐使用stores参数 */
  onupgradeneeded?: (e: IDBVersionChangeEvent, db: IDBDatabase) => void
  /**创建的store列表，store与就db不同ver会自动更新，单传入string默认autoIncrement为true
   *
   * 如果不传值，则不会操作store相关保持原有状态
   */
  stores?: (
    | T
    | {
        name: T
        /**默认是true */
        autoIncrement?: boolean
        keyPath?: string | string[] | null
      }
  )[]
}>

export default class IndexedDB2<Stores extends string> {
  asyncLock: AsyncLock
  private db: IDBDatabase

  dbName: string
  option: Option<Stores>
  nowVer: number
  constructor(dbName: string, option: Option<Stores> = {}) {
    this.dbName = dbName
    this.option = option
    this.asyncLock = new AsyncLock()

    this.init()
  }
  private async init(): Promise<void> {
    let existDbList = await indexedDB.databases()
    this.nowVer = existDbList.find((d) => d.name === this.dbName)?.version ?? 1
    this.db = await this.openDb()

    let updateDb = async () => {
      this.nowVer++
      console.log(`[IndexedDB2:init] upgrade db:${this.dbName}`, this.nowVer)
      this.db.close()
      this.db = await this.openDb(this.nowVer, updateStores)
    }
    let updateStores = this.checkStoreUpdate(this.db)
    let existStores = Array.from(this.db.objectStoreNames)
    let optionStores = this.option.stores
      ?.map((store) => (isObject(store) ? store.name : store))
      .sort((a, b) => a.localeCompare(b))
    if (
      this.option.stores &&
      (!isEqual(existStores, optionStores) || updateStores.length)
    ) {
      await updateDb()
    }

    this.asyncLock.ok()

    return
  }

  private checkStoreUpdate(db: IDBDatabase) {
    if (!this.option.stores) return []
    let existStores = Array.from(db.objectStoreNames)
    let delStores = existStores.filter(
      (store) =>
        ![...this.option.stores].find(
          (_store) => (isObject(_store) ? _store.name : _store) === store
        )
    )
    let updateStores = existStores
      .map((eStore) => {
        if (delStores.includes(eStore)) return null
        let objectStore = db.transaction(eStore, 'readonly').objectStore(eStore)
        let optConfStore = this.option.stores.find(
            (n) => (isObject(n) ? n.name : n) === eStore
          ),
          name = isObject(optConfStore) ? optConfStore.name : optConfStore,
          option: IDBObjectStoreParameters = isObject(optConfStore)
            ? { autoIncrement: true, ...omit(optConfStore, ['name']) }
            : { autoIncrement: true }

        if (
          (!isUndefined(option.keyPath) &&
            !isEqual(objectStore.keyPath, option.keyPath)) ||
          (!isUndefined(option.autoIncrement) &&
            !isEqual(objectStore.autoIncrement, option.autoIncrement))
        ) {
          return { name, ...option }
        }
        return null
      })
      .filter((v) => !!v)

    return updateStores
  }

  private async openDb(
    ver?: number,
    updateStores?: {
      autoIncrement?: boolean
      keyPath?: string | string[]
      name: Stores
    }[]
  ) {
    const dbRequest = indexedDB.open(this.dbName, ver)
    console.log(`[IndexedDB2:open] db:${this.dbName} ver:${ver ?? this.nowVer}`)
    let db = await new Promise<IDBDatabase>((resolve, reject) => {
      dbRequest.onupgradeneeded = (e) => {
        let db = (e.target as any)?.result as IDBDatabase
        this.option?.onupgradeneeded?.(e, db)

        if (!this.option.stores) return
        let existStores = Array.from(db.objectStoreNames)

        let newStores = this.option.stores.filter(
          (store) => !existStores.includes(isObject(store) ? store.name : store)
        )
        let delStores = existStores.filter(
          (store) =>
            ![...this.option.stores].find(
              (_store) => (isObject(_store) ? _store.name : _store) === store
            )
        )

        console.log(
          '[IndexedDB2:createStore] existStores',
          existStores,
          'newStores',
          newStores,
          'delStores',
          delStores,
          'updateStores',
          updateStores
        )

        newStores.forEach((store) => {
          let name = isObject(store) ? store.name : store,
            option: IDBObjectStoreParameters = isObject(store)
              ? omit(store, ['name'])
              : { autoIncrement: true }
          !db.objectStoreNames.contains(name) &&
            db.createObjectStore(name, option)
        })
        delStores.forEach((name) => {
          db.objectStoreNames.contains(name) && db.deleteObjectStore(name)
        })
        updateStores?.forEach?.(({ name, ...option }) => {
          db.objectStoreNames.contains(name) && db.deleteObjectStore(name)
          db.createObjectStore(name, option)
        })
      }
      dbRequest.addEventListener('success', () => resolve(dbRequest.result))
      dbRequest.onerror = (error) => {
        console.error(error)
        reject()
      }
    })
    return db
  }

  async getDb(): Promise<IDBDatabase> {
    await this.asyncLock.waiting()
    return this.db
  }

  private _get<T = any>(
    db: IDBDatabase,
    storeNames: Stores,
    query: IDBValidKey | IDBKeyRange,
    options?: IDBTransactionOptions
  ): Promise<T> {
    return this._transaction(
      db,
      storeNames,
      (os) => os.get(query),
      'readonly',
      options
    )
  }
  async get<T = any>(
    storeNames: Stores,
    query: IDBValidKey | IDBKeyRange,
    options?: IDBTransactionOptions
  ): Promise<T> {
    await this.asyncLock.waiting()

    return this._get(this.db, storeNames, query, options)
  }

  private _set(
    db: IDBDatabase,
    storeNames: Stores,
    value: any,
    key?: IDBValidKey,
    options?: IDBTransactionOptions
  ): Promise<IDBValidKey> {
    return this._transaction(
      db,
      storeNames,
      (os) => os.add(value, key),
      'readwrite',
      options
    )
  }
  async set(
    storeNames: Stores,
    value: any,
    key?: IDBValidKey,
    options?: IDBTransactionOptions
  ): Promise<IDBValidKey> {
    await this.asyncLock.waiting()

    return this._set(this.db, storeNames, value, key, options)
  }

  private async _transaction<T = any>(
    db: IDBDatabase,
    storeNames: Stores,
    callback: (objectStore: IDBObjectStore) => IDBRequest<IDBValidKey>,
    mode: IDBTransactionMode = 'readwrite',
    options?: IDBTransactionOptions
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let transaction = db.transaction(storeNames, mode, options)
      let objectStore = transaction.objectStore(storeNames)
      let promise = callback(objectStore)
      promise.addEventListener('success', (e) => {
        resolve(promise.result as any)
      })
      promise.onerror = reject
    })
  }
  async transaction<T = any>(
    storeNames: Stores,
    callback: (objectStore: IDBObjectStore) => IDBRequest<IDBValidKey>,
    mode: IDBTransactionMode = 'readwrite',
    options?: IDBTransactionOptions
  ): Promise<T> {
    await this.asyncLock.waiting()

    return this._transaction(this.db, storeNames, callback, mode, options)
  }
}
