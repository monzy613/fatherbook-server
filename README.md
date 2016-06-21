#SOA项目文档
###项目名 SOA －－－ Son Of Alien
***
##组员名单
1353003 张逸
1352992 慕飞腾
1352982 张文佳
1352998 郭天宇
1353000 刘嘉洋
***
##项目概览
服务端： nodejs + express + mongodb
客户端： 安卓， ios
web端： swig引擎
***
##第三方SDK
七牛云： 图片存储
融云： 私信
***
##接口详细
## 状态码一览
```json
{
    "000": ("Network error", false),
    "100": ("Get RC Token Success", true),
    "110": ("Get RC Token Failed", false),
    "200": ("Login Success", true),
    "210": ("Wrong password or account", false),

    "300": ("验证码已发送", true),
    "310": ("手机号已被注册", false),
    "320": ("验证码正确", true),
    "330": ("验证码不正确", false),

    "340": ("Register success", true),
    "350": ("Register failed", false),
    "370": ("Account exist", false),

    "400": ("搜索成功", true),
    "410": ("未找到符合条件的用户", false),

    "500": ("关注成功", true),
    "510": ("关注失败", false),
    "520": ("取消关注成功", true),
    "530": ("取消关注失败", false),
    "540": ("获取关注列表成功", true),
    "550": ("获取关注列表失败", false),

    "600": ("timeline 发送成功", true),
    "610": ("timeline 发送失败", false),
    "620": ("timeline 获取成功", true),
    "630": ("timeline 获取失败", false),
    "635": ("查无此人", false),

    "640": ("点赞成功", true),
    "650": ("点赞失败", false),
    "660": ("取消点赞成功", true),
    "670": ("取消点赞失败", false),

    "700": ("请求头像token成功", true),
    "710": ("请求头像token失败", false),
    "720": ("头像修改成功", true),
    "730": ("头像修改失败", false),

    "740": ("评论成功", true),
    "750": ("评论失败, timeline不存在", false),
    "770": ("评论失败", false),

    "780": ("获取评论列表成功", true),
    "790": ("获取评论列表失败", false),
}
```
***
#### 注册
##### URL http://42.96.155.17:3000/mobile/app.register
##### 支持格式
###### JSON
##### HTTP请求方式
###### POST
##### 请求参数
| param        |字段类型| 必选           | 说明  |
| ------------ |:---:|:-------------:| -----:|
| account      | string |true | 帐号 |
| password     | string |true      |   密码 |
| nickname     | string |false      |    昵称 |
##### 返回结果 JSON示例
######成功
```json
{
  "status": "340"
}
```
######失败
```json
{
  "status": "370"
}
```
***

#### 登陆
##### URL http://42.96.155.17:3000/mobile/app.login
##### 支持格式
###### JSON
##### HTTP请求方式
###### POST
##### 请求参数
| param        |字段类型| 必选           | 说明  |
| ------------ |:-----:|:-------------:| -----:|
| account      |string| true | 帐号 |
| password     |string| true      |   密码 |
##### 返回结果 JSON示例
######成功
```json
{
  "status": "200",
  "userInfo": {
    "account": "test",
    "nickname": "TEST",
    "isDefaultAvatar": true,
    "follow_infos": []
  },
  "config": {
    "rcAppkey": "pwe86ga5em5h6",
    "rcAppSecret": "62E6XCr7Mj",
    "qnBucketDomain": "http://o7b20it1b.bkt.clouddn.com"
  }
}
```
##### 返回字段说明
| param        |字段类型| 说明  |
| ------------ |:-----: | -----:|
| status      |string | 状态码 |
| userInfo     |object|   用户信息 |
| config     |object|   一些配置信息, 融云token和七牛图片域名 |
***

#### 获取上传新头像的token
##### URL http://42.96.155.17:3000/mobile/app.changeavatar
##### 支持格式
###### JSON
##### HTTP请求方式
###### POST
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| account      | true | 帐号 |
##### 返回结果 JSON示例
######成功
```json
{
  "status": "700",
  "token": "hXxhiug5AmKnXTSGECNFWy2Bo0QRzrDqo7bst8rS:SWEYEPGoBDsCXv2KS7H51XZkr5w=:eyJzY29wZSI6ImZhdGhlcmJvb2s6dXNlckF2YXRhci90ZXN0LmpwZWciLCJkZWFkbGluZSI6MTQ2NjQ5MTE5M30=",
  "filename": "userAvatar/test.jpeg"
}
```
##### 返回字段说明
| param        |字段类型| 说明  |
| ------------ |:-----: | -----:|
| status      |string | 状态码 |
| token      |string | 七牛上传图片所需token |
| filename      |string | 七牛上传图片所需key |
***

#### 上传头像到七牛成功
##### URL http://42.96.155.17:3000/mobile/app.changeavatar.success
##### 支持格式
###### JSON
##### HTTP请求方式
###### POST
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| account      | true | 帐号 |
##### 返回结果 JSON示例
######成功
```json
{
  "status": "720",
  "filename": "userAvatar/test.jpeg"
}
```
##### 返回字段说明
| param        |字段类型| 说明  |
| ------------ |:-----: | -----:|
| status      |string | 状态码 |
| filename      |string | 图片文件名 |
***

#### 获取融云token
##### URL http://42.96.155.17:3000/mobile/app.rongcloud.token
##### 支持格式
###### JSON
##### HTTP请求方式
###### POST
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| account      | true | 帐号 |
##### 返回结果 JSON示例
######成功
```json
{
  "status": "100",
  "rcToken": "5PKj9sQXS+OUrTVqMKTsJFfPZNc7xXj1I/NyOPG8O5wGaZzJ1dNLLabF9NTxrj1oPJlAzlBhohfYfSkEAxGIYQ=="
}
```
##### 返回字段说明
| param        |字段类型| 说明  |
| ------------ |:-----: | -----:|
| status      |string | 状态码 |
| rcToken      |string | 融云token |
***

#### 搜索用户
##### URL http://42.96.155.17:3000/mobile/app.search.account
##### 支持格式
###### JSON
##### HTTP请求方式
###### POST
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| account      | true | 帐号 |
| searchString | true | 帐号字串 |
##### 返回结果 JSON示例
######成功
```json
{
  "status": "400",
  "users": [
    {
      "_id": "a",
      "nickname": "A",
      "__v": 0,
      "avatarURL": "userAvatar/a.jpeg",
      "isDefaultAvatar": false
    },
    {
      "_id": "adm",
      "nickname": "ADM",
      "avatarURL": "userAvatar/adm.jpeg",
      "isDefaultAvatar": false
    },
    {
      "_id": "wang",
      "nickname": "wang",
      "__v": 0,
      "avatarURL": "userAvatar/wang.jpeg",
      "isDefaultAvatar": true
    }
  ]
}
```
##### 返回字段说明
| param        |字段类型| 说明  |
| ------------ |:-----: | -----:|
| status      |string | 状态码 |
| users      |array | userInfo数组 |
***

#### 获取关注列表
##### URL http://42.96.155.17:3000/mobile/app.friend.following
##### 支持格式
###### JSON
##### HTTP请求方式
###### POST
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| account      | true | 帐号 |
##### 返回结果 JSON示例
######成功
```json
{
  "status": "540",
  "follow_infos": [
    {
      "type": 1,
      "_id": "2086215745@qq.com",
      "nickname": "2086215745@qq.com",
      "isDefaultAvatar": true,
      "__v": 0
    },
    {
      "type": 2,
      "_id": "a",
      "nickname": "A",
      "__v": 0,
      "avatarURL": "userAvatar/a.jpeg",
      "isDefaultAvatar": false
    },
    {
      "type": 1,
      "_id": "lynn",
      "nickname": "LY",
      "__v": 0,
      "avatarURL": "userAvatar/lynn.jpeg",
      "isDefaultAvatar": true
    },
    {
      "type": 1,
      "_id": "monzy",
      "nickname": "Monzy",
      "avatarURL": "userAvatar/monzy.jpeg",
      "isDefaultAvatar": false
    },
    {
      "type": 1,
      "_id": "monzy613",
      "nickname": "MZ",
      "__v": 0,
      "avatarURL": "userAvatar/monzy613.jpeg",
      "isDefaultAvatar": true
    },
    {
      "type": 1,
      "_id": "oo",
      "nickname": "oo",
      "isDefaultAvatar": true,
      "__v": 0
    },
    {
      "type": 2,
      "_id": "pt",
      "nickname": "Pity",
      "__v": 0,
      "avatarURL": "userAvatar/pt.jpeg",
      "isDefaultAvatar": false
    },
    {
      "type": 1,
      "_id": "wang",
      "nickname": "wang",
      "__v": 0,
      "avatarURL": "userAvatar/wang.jpeg",
      "isDefaultAvatar": true
    },
    {
      "type": 2,
      "_id": "z",
      "nickname": "z",
      "__v": 0,
      "avatarURL": "userAvatar/z.jpeg",
      "isDefaultAvatar": true
    },
    {
      "type": 1,
      "_id": "zy",
      "nickname": "zy",
      "__v": 0,
      "avatarURL": "userAvatar/zy.jpeg",
      "isDefaultAvatar": true
    },
    {
      "type": 1,
      "_id": "zz",
      "nickname": "zz",
      "isDefaultAvatar": false,
      "__v": 0,
      "avatarURL": "userAvatar/zz.jpeg"
    }
  ]
}
```
##### 返回字段说明
| param        |字段类型| 说明  |
| ------------ |:-----: | -----:|
| status      |string | 状态码 |
| follow_infos      |array | 关注者userInfo数组 |
***

#### 关注
##### URL http://42.96.155.17:3000/mobile/app.friend.follow
##### 支持格式
###### JSON
##### HTTP请求方式
###### POST
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| account      | true | 帐号 |
| targetID      | true | 目标用户ID |
##### 返回结果 JSON示例
######成功
```json
{
  "status": "500"
}
```
***

#### 取消关注
##### URL http://42.96.155.17:3000/mobile/app.friend.unfollow
##### 支持格式
###### JSON
##### HTTP请求方式
###### POST
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| account      | true | 帐号 |
| targetID      | true | 目标用户ID |
##### 返回结果 JSON示例
######成功
```json
{
  "status": "520"
}
```
***

#### 发timeline
##### URL http://42.96.155.17:3000/mobile/app.timeline.post
##### 支持格式
###### JSON
##### HTTP请求方式
###### POST
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| account      | true | 帐号 |
| password      | true | 密码 |
| text | true | timeline 文字内容 | 
| images | false | timeline 图片信息 | 
##### 返回结果 JSON示例
######成功
```json
{
  "success": "600",
  "_id": 8
}
```
##### 返回字段说明
| param        |字段类型| 说明  |
| ------------ |:-----: | -----:|
| status      |string | 状态码 |
| _id      |int | 所发timeline的id |
***

#### 获取指定用户所有timeline
##### URL http://42.96.155.17:3000/mobile/app.timeline.get
##### 支持格式
###### JSON
##### HTTP请求方式
###### GET
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| account      | true | 帐号 |
##### 返回结果 JSON示例
######成功
```json
{
  "status": "620",
  "timelines": [
    {
      "_id": 3,
      "account": "15221529908",
      "userInfo": {
        "_id": "15221529908",
        "nickname": "15221529908",
        "isDefaultAvatar": false,
        "__v": 0,
        "avatarURL": "userAvatar/15221529908.jpeg"
      },
      "text": "哈哈哈哈哈",
      "timeStamp": "1465180858",
      "repostCount": 0,
      "isRepost": false,
      "commentCount": 0,
      "liked": [
        {
          "_id": "15221529908",
          "nickname": "15221529908",
          "isDefaultAvatar": true,
          "__v": 0
        }
      ],
      "images": []
    },
    {
      "_id": 4,
      "account": "15221529908",
      "userInfo": {
        "_id": "15221529908",
        "nickname": "15221529908",
        "isDefaultAvatar": false,
        "__v": 0,
        "avatarURL": "userAvatar/15221529908.jpeg"
      },
      "text": "哈哈哈哈哈哈",
      "timeStamp": "1465181065",
      "repostCount": 0,
      "isRepost": false,
      "commentCount": 0,
      "liked": [
        {
          "_id": "15221529908",
          "nickname": "15221529908",
          "isDefaultAvatar": true,
          "__v": 0
        },
        {
          "_id": "adm",
          "nickname": "ADM",
          "avatarURL": "userAvatar/adm.jpeg",
          "isDefaultAvatar": false
        }
      ],
      "images": []
    }
  ]
}
```
##### 返回字段说明
| param        |字段类型| 说明  |
| ------------ |:-----: | -----:|
| status      |string | 状态码 |
| timelines      |array | timeline数组 |
***

#### 获取指定用户相关的所有timeline
##### URL http://42.96.155.17:3000/mobile/app.timeline.getByFollowing
##### 支持格式
###### JSON
##### HTTP请求方式
###### GET
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| account      | true | 帐号 |
| maxID      | false | timelineID 小于等于maxID |
| minID      | false | timelineID 大于等于maxID |
| count      | false | 一次获得的最大数量， 默认30条 |
##### 返回结果 JSON示例
#####count = 2, account = 15221529908
```json
{
  "status": "620",
  "timelines": [
    {
      "_id": 8,
      "account": "adm",
      "userInfo": {
        "_id": "adm",
        "nickname": "ADM",
        "avatarURL": "userAvatar/adm.jpeg",
        "isDefaultAvatar": false
      },
      "text": "text timeline",
      "timeStamp": "1466488931",
      "repostCount": 0,
      "isRepost": false,
      "liked": [],
      "images": []
    },
    {
      "_id": 5,
      "account": "adm",
      "userInfo": {
        "_id": "adm",
        "nickname": "ADM",
        "avatarURL": "userAvatar/adm.jpeg",
        "isDefaultAvatar": false
      },
      "text": "21岁的第一天就注定了今年又不能早睡了",
      "timeStamp": "1465764505",
      "repostCount": 0,
      "isRepost": false,
      "commentCount": 0,
      "liked": [],
      "images": [
        {
          "width": 1000,
          "index": 0,
          "height": 1334,
          "url": "5/0.jpg"
        }
      ]
    }
  ]
}
```
##### 返回字段说明
| param        |字段类型| 说明  |
| ------------ |:-----: | -----:|
| status      |string | 状态码 |
| timelines      |array | timeline数组 |
***

#### timeline点赞
##### URL http://42.96.155.17:3000/mobile/app.timeline.like
##### 支持格式
###### JSON
##### HTTP请求方式
###### POST
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| account      | true | 帐号 |
| timelineID | true | timeline ID |
##### 返回结果 JSON示例
######成功
```json
{
  "status": "640",
  "liked": {
    "ok": 1,
    "nModified": 1,
    "n": 1
  }
}
```
***

#### timeline取消赞
##### URL http://42.96.155.17:3000/mobile/app.timeline.unlike
##### 支持格式
###### JSON
##### HTTP请求方式
###### POST
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| account      | true | 帐号 |
| timelineID | true | timeline ID |
##### 返回结果 JSON示例
######成功
```json
{
  "status": "660",
  "liked": {
    "ok": 1,
    "nModified": 1,
    "n": 1
  }
}
```
***

#### 评论
##### URL http://42.96.155.17:3000/mobile/app.timeline.comment
##### 支持格式
###### JSON
##### HTTP请求方式
###### POST
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| account      | true | 帐号 |
| timelineID | true | timeline ID |
| content | true | 评论内容 |
##### 返回结果 JSON示例
######成功
```json
{
  "status": "740"
}
```
***

#### 获取评论列表
##### URL http://42.96.155.17:3000/mobile/app.timeline.comment
##### 支持格式
###### JSON
##### HTTP请求方式
###### GET
##### 请求参数
| param        | 必选           | 说明  |
| ------------- |:-------------:| -----:|
| timelineID | true | timeline ID |
##### 返回结果 JSON示例
######成功
```json
{
  "status": 780,
  "comments": [
    {
      "timelineID": 1,
      "content": "wow",
      "timeStamp": "1466488707",
      "userInfo": {
        "isDefaultAvatar": false,
        "avatarURL": "userAvatar/adm.jpeg",
        "nickname": "ADM",
        "_id": "adm"
      }
    }
  ]
}
```
##### 返回字段说明
| param        |字段类型| 说明  |
| ------------ |:-----: | -----:|
| status      |string | 状态码 |
| comments      |array | 评论数组 |
***