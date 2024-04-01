# 结构设计
## settingMainManager
- 不用传入configStore
- 用一个不会变地址的memo对象`initConfig`保存改动的config
  - 处理已保存的设置，附加到`initConfig`中
  - 传`onChange`方法到`Row`组件中，`Row`更改时调用改方法修改`initConfig`

## Row
### 子功能
- Reset
- 判断`initConfig`中是否有该key值，显示在左边颜色
- 中间的渲染判断