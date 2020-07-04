学习参考[在淘宝优化了一个大型项目，分享一些干货](https://juejin.im/post/5edd942af265da76f8601199),做些笔记记录下

## 用 splitChunks 默认配置打包

```js
module.exports = {
  //...
  optimization: {
    splitChunks: {
      //在cacheGroups外层的属性设定适用于所有缓存组，不过每个缓存组内部可以重设这些属性
      chunks: 'async', //将什么类型的代码块用于分割，三选一： "initial"：入口代码块 | "all"：全部 | "async"：按需加载的代码块
      minSize: 30000, //大小超过30kb的模块才会被提取
      maxSize: 0, //只是提示，可以被违反，会尽量将chunk分的比maxSize小，当设为0代表能分则分，分不了不会强制
      minChunks: 1, //某个模块至少被多少代码块引用，才会被提取成新的chunk
      maxAsyncRequests: 5, //分割后，按需加载的代码块最多允许的并行请求数，在webpack5里默认值变为6
      maxInitialRequests: 3, //分割后，入口代码块最多允许的并行请求数，在webpack5里默认值变为4
      automaticNameDelimiter: '~', //代码块命名分割符
      name: true, //每个缓存组打包得到的代码块的名称
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/, //匹配node_modules中的模块
          priority: -10 //优先级，当模块同时命中多个缓存组的规则时，分配到优先级高的缓存组
        },
        default: {
          minChunks: 2, //覆盖外层的全局属性
          priority: -20,
          reuseExistingChunk: true //是否复用已经从原代码块中分割出来的模块
        }
      }
    }
  }
}
```

打包结果：

```
Hash: e686014487ebdacdf139
Version: webpack 4.43.0
Time: 61ms
Built at: 2020-07-04 10:37:32
   Asset      Size  Chunks             Chunk Names
pageA.js  5.75 KiB   pageA  [emitted]  pageA
pageB.js  5.63 KiB   pageB  [emitted]  pageB
pageC.js  5.01 KiB   pageC  [emitted]  pageC
Entrypoint pageA = pageA.js
Entrypoint pageB = pageB.js
Entrypoint pageC = pageC.js
[./node_modules/vendor1.js] 55 bytes {pageA} [built]
[./node_modules/vendor2.js] 55 bytes {pageB} [built]
[./pageA.js] 142 bytes {pageA} [built]
[./pageB.js] 142 bytes {pageB} [built]
[./pageC.js] 111 bytes {pageC} [built]
[./util1.js] 82 bytes {pageA} [built]
[./util2.js] 51 bytes {pageA} {pageB} {pageC} [built]
[./util3.js] 51 bytes {pageB} {pageC} [built]
```

## 修改后的配置打包

```js
module.exports = {
  //...
  optimization: {
    chunkIds: 'named', // 指定打包过程中的chunkId，设为named会生成可读性好的chunkId，便于debug
    splitChunks: {
      minSize: 0, // 默认30000（30kb），但是demo中的文件都很小，minSize设为0，让每个文件都满足大小条件
      cacheGroups: {
        commons: {
          chunks: 'initial',
          minChunks: 2,
          maxInitialRequests: 3 // 默认为3
        },
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor'
        }
      }
    }
  }
}
```

打包结果：

```
Hash: a3a899bedd0108470f44
Version: webpack 4.43.0
Time: 65ms
Built at: 2020-07-04 11:15:22
                       Asset       Size                     Chunks             Chunk Names
commons~pageA~pageB~pageC.js  521 bytes  commons~pageA~pageB~pageC  [emitted]  commons~pageA~pageB~pageC
                    pageA.js   7.57 KiB                      pageA  [emitted]  pageA
                    pageB.js   7.45 KiB                      pageB  [emitted]  pageB
                    pageC.js   7.31 KiB                      pageC  [emitted]  pageC
                   vendor.js   1.06 KiB                     vendor  [emitted]  vendor
Entrypoint pageA = commons~pageA~pageB~pageC.js vendor.js pageA.js
Entrypoint pageB = commons~pageA~pageB~pageC.js vendor.js pageB.js
Entrypoint pageC = commons~pageA~pageB~pageC.js pageC.js
[./node_modules/vendor1.js] 55 bytes {vendor} [built]
[./node_modules/vendor2.js] 55 bytes {vendor} [built]
[./pageA.js] 142 bytes {pageA} [built]
[./pageB.js] 142 bytes {pageB} [built]
[./pageC.js] 111 bytes {pageC} [built]
[./util1.js] 82 bytes {pageA} [built]
[./util2.js] 51 bytes {commons~pageA~pageB~pageC} [built]
[./util3.js] 51 bytes {pageB} {pageC} [built]
```

## 修改 maxInitialRequests 为 5

```js
module.exports = {
  optimization: {
    chunkIds: 'named', // 指定打包过程中的chunkId，设为named会生成可读性好的chunkId，便于debug
    splitChunks: {
      minSize: 0, // 默认30000（30kb），但是demo中的文件都很小，minSize设为0，让每个文件都满足大小条件
      cacheGroups: {
        commons: {
          chunks: 'initial',
          minChunks: 2,
          maxInitialRequests: 5 // 默认为3
        },
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor'
        }
      }
    }
  }
}
```

打包结果：

```
Hash: 859d335e2b4266e44bf4
Version: webpack 4.43.0
Time: 70ms
Built at: 2020-07-04 17:33:31
                       Asset       Size                     Chunks             Chunk Names
commons~pageA~pageB~pageC.js  521 bytes  commons~pageA~pageB~pageC  [emitted]  commons~pageA~pageB~pageC
      commons~pageB~pageC.js  515 bytes        commons~pageB~pageC  [emitted]  commons~pageB~pageC
                    pageA.js   7.57 KiB                      pageA  [emitted]  pageA
                    pageB.js   7.06 KiB                      pageB  [emitted]  pageB
                    pageC.js   6.92 KiB                      pageC  [emitted]  pageC
                   vendor.js   1.06 KiB                     vendor  [emitted]  vendor
Entrypoint pageA = commons~pageA~pageB~pageC.js vendor.js pageA.js
Entrypoint pageB = commons~pageA~pageB~pageC.js vendor.js commons~pageB~pageC.js pageB.js
Entrypoint pageC = commons~pageA~pageB~pageC.js commons~pageB~pageC.js pageC.js
[./node_modules/vendor1.js] 55 bytes {vendor} [built]
[./node_modules/vendor2.js] 55 bytes {vendor} [built]
[./pageA.js] 142 bytes {pageA} [built]
[./pageB.js] 142 bytes {pageB} [built]
[./pageC.js] 111 bytes {pageC} [built]
[./util1.js] 82 bytes {pageA} [built]
[./util2.js] 51 bytes {commons~pageA~pageB~pageC} [built]
[./util3.js] 51 bytes {commons~pageB~pageC} [built]
```

## 注释掉 name 属性

```js
module.exports = {
  optimization: {
    chunkIds: 'named', // 指定打包过程中的chunkId，设为named会生成可读性好的chunkId，便于debug
    splitChunks: {
      minSize: 0, // 默认30000（30kb），但是demo中的文件都很小，minSize设为0，让每个文件都满足大小条件
      cacheGroups: {
        commons: {
          chunks: 'initial',
          minChunks: 2,
          maxInitialRequests: 5 // 默认为3
        },
        vendor: {
          test: /node_modules/,
          chunks: 'initial'
          // name: 'vendor'
        }
      }
    }
  }
}
```

打包结果：

```
Hash: 2bf6f84a4aa9dd4ccad1
Version: webpack 4.43.0
Time: 64ms
Built at: 2020-07-04 17:45:26
                       Asset       Size                     Chunks             Chunk Names
commons~pageA~pageB~pageC.js  521 bytes  commons~pageA~pageB~pageC  [emitted]  commons~pageA~pageB~pageC
      commons~pageB~pageC.js  515 bytes        commons~pageB~pageC  [emitted]  commons~pageB~pageC
                    pageA.js   7.58 KiB                      pageA  [emitted]  pageA
                    pageB.js   7.06 KiB                      pageB  [emitted]  pageB
                    pageC.js   6.92 KiB                      pageC  [emitted]  pageC
             vendor~pageA.js  588 bytes               vendor~pageA  [emitted]  vendor~pageA
             vendor~pageB.js  588 bytes               vendor~pageB  [emitted]  vendor~pageB
Entrypoint pageA = commons~pageA~pageB~pageC.js vendor~pageA.js pageA.js
Entrypoint pageB = commons~pageA~pageB~pageC.js commons~pageB~pageC.js vendor~pageB.js pageB.js
Entrypoint pageC = commons~pageA~pageB~pageC.js commons~pageB~pageC.js pageC.js
[./node_modules/vendor1.js] 55 bytes {vendor~pageA} [built]
[./node_modules/vendor2.js] 55 bytes {vendor~pageB} [built]
[./pageA.js] 142 bytes {pageA} [built]
[./pageB.js] 142 bytes {pageB} [built]
[./pageC.js] 111 bytes {pageC} [built]
[./util1.js] 82 bytes {pageA} [built]
[./util2.js] 51 bytes {commons~pageA~pageB~pageC} [built]
[./util3.js] 51 bytes {commons~pageB~pageC} [built]
```

## name = false

```js
module.exports = {
  // ...
  optimization: {
    chunkIds: 'named', // 指定打包过程中的chunkId，设为named会生成可读性好的chunkId，便于debug
    splitChunks: {
      minSize: 0, // 默认30000（30kb），但是demo中的文件都很小，minSize设为0，让每个文件都满足大小条件
      name: false,
      cacheGroups: {
        commons: {
          chunks: 'initial',
          minChunks: 2,
          maxInitialRequests: 5 // 默认为3
        },
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor'
        }
      }
    }
  }
}
```

打包结果：

```
Hash: fab791d342e403b205e4
Version: webpack 4.43.0
Time: 68ms
Built at: 2020-07-04 19:41:37
    Asset       Size  Chunks             Chunk Names
     0.js  495 bytes       0  [emitted]
     1.js  495 bytes       1  [emitted]
 pageA.js   7.55 KiB   pageA  [emitted]  pageA
 pageB.js   7.01 KiB   pageB  [emitted]  pageB
 pageC.js   6.87 KiB   pageC  [emitted]  pageC
vendor.js   1.06 KiB  vendor  [emitted]  vendor
Entrypoint pageA = 0.js vendor.js pageA.js
Entrypoint pageB = 0.js vendor.js 1.js pageB.js
Entrypoint pageC = 0.js 1.js pageC.js
[./node_modules/vendor1.js] 55 bytes {vendor} [built]
[./node_modules/vendor2.js] 55 bytes {vendor} [built]
[./pageA.js] 142 bytes {pageA} [built]
[./pageB.js] 142 bytes {pageB} [built]
[./pageC.js] 111 bytes {pageC} [built]
[./util1.js] 82 bytes {pageA} [built]
[./util2.js] 51 bytes {0} [built]
[./util3.js] 51 bytes {1} [built]
```

> 以上都是针对入口文件的优化，下面加入 **按需加载** 的代码

## 按需加载 1

```js
module.exports = {
  optimization: {
    chunkIds: 'named', // 指定打包过程中的chunkId，设为named会生成可读性好的chunkId，便于debug
    splitChunks: {
      minSize: 0, // 默认30000（30kb），但是demo中的文件都很小，minSize设为0，让每个文件都满足大小条件
      // name:false,
      cacheGroups: {
        commons: {
          chunks: 'all', //加入按需加载后，设为all将所有模块包括在优化范围内
          minChunks: 2,
          maxInitialRequests: 5 // 默认为3，无法满足我们的分包数量
        },
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor'
        }
      }
    }
  }
}
```

打包结果：

```
Hash: 26702677d891bc2f0e2a
Version: webpack 4.43.0
Time: 80ms
Built at: 2020-07-04 21:18:16
                       Asset       Size                     Chunks             Chunk Names
                        0.js  625 bytes                          0  [emitted]
                        1.js  625 bytes                          1  [emitted]
commons~pageA~pageB~pageC.js  521 bytes  commons~pageA~pageB~pageC  [emitted]  commons~pageA~pageB~pageC
      commons~pageB~pageC.js  515 bytes        commons~pageB~pageC  [emitted]  commons~pageB~pageC
                    pageA.js   10.6 KiB                      pageA  [emitted]  pageA
                    pageB.js   7.06 KiB                      pageB  [emitted]  pageB
                    pageC.js   6.92 KiB                      pageC  [emitted]  pageC
                   vendor.js   1.06 KiB                     vendor  [emitted]  vendor
Entrypoint pageA = commons~pageA~pageB~pageC.js vendor.js pageA.js
Entrypoint pageB = commons~pageA~pageB~pageC.js vendor.js commons~pageB~pageC.js pageB.js
Entrypoint pageC = commons~pageA~pageB~pageC.js commons~pageB~pageC.js pageC.js
chunk    {0} 0.js 83 bytes <{commons~pageA~pageB~pageC}> <{pageA}> <{vendor}> [rendered]
 [./async1.js] 83 bytes {0} [built]
chunk    {1} 1.js 83 bytes <{commons~pageA~pageB~pageC}> <{pageA}> <{vendor}> [rendered]
 [./async2.js] 83 bytes {1} [built]
chunk {commons~pageA~pageB~pageC} commons~pageA~pageB~pageC.js (commons~pageA~pageB~pageC) 51 bytes ={commons~pageB~pageC}= ={pageA}= ={pageB}= ={pageC}= ={vendor}= >{0}< >{1}< [initial] [rendered] split chunk (cache group: commons) (name: commons~pageA~pageB~pageC)
 [./util2.js] 51 bytes {commons~pageA~pageB~pageC} [built]
chunk {commons~pageB~pageC} commons~pageB~pageC.js (commons~pageB~pageC) 51 bytes ={commons~pageA~pageB~pageC}= ={pageB}= ={pageC}= ={vendor}= [initial] [rendered] split chunk (cache group: commons) (name: commons~pageB~pageC)
 [./util3.js] 51 bytes {commons~pageB~pageC} [built]
chunk {pageA} pageA.js (pageA) 283 bytes ={commons~pageA~pageB~pageC}= ={vendor}= >{0}< >{1}< [entry] [rendered]
 [./pageA.js] 201 bytes {pageA} [built]
 [./util1.js] 82 bytes {pageA} [built]
chunk {pageB} pageB.js (pageB) 142 bytes ={commons~pageA~pageB~pageC}= ={commons~pageB~pageC}= ={vendor}= [entry] [rendered]
 [./pageB.js] 142 bytes {pageB} [built]
chunk {pageC} pageC.js (pageC) 111 bytes ={commons~pageA~pageB~pageC}= ={commons~pageB~pageC}= [entry] [rendered]
 [./pageC.js] 111 bytes {pageC} [built]
chunk {vendor} vendor.js (vendor) 110 bytes ={commons~pageA~pageB~pageC}= ={commons~pageB~pageC}= ={pageA}= ={pageB}= >{0}< >{1}< [initial] [rendered] split chunk (cache group: vendor) (name: vendor)
 [./node_modules/vendor1.js] 55 bytes {vendor} [built]
 [./node_modules/vendor2.js] 55 bytes {vendor} [built]
[./async1.js] 83 bytes {0} [built]
[./async2.js] 83 bytes {1} [built]
[./node_modules/vendor1.js] 55 bytes {vendor} [built]
[./node_modules/vendor2.js] 55 bytes {vendor} [built]
[./pageA.js] 201 bytes {pageA} [built]
[./pageB.js] 142 bytes {pageB} [built]
[./pageC.js] 111 bytes {pageC} [built]
[./util1.js] 82 bytes {pageA} [built]
[./util2.js] 51 bytes {commons~pageA~pageB~pageC} [built]
[./util3.js] 51 bytes {commons~pageB~pageC} [built]
```
