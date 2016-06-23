#SOA project document
###SOA －－－ Son Of Alien
***
##member
1353003 张逸
1352992 慕飞腾
1352982 张文佳
1352998 郭天宇
1353000 刘嘉洋
***
##code
/public/ js css resource document eg.
/routes/ routes
/util/ some tool methods
/views/ html document
/node_modules/ nodejs middleware
##project description
server： nodejs + express + mongodb
client： Android， ios
web： swig engine
***
##The third party SDK
七牛云： picture storage
融云： private message
***
##interface
## status code
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
#### register
##### URL http://42.96.155.17:3000/mobile/app.register
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        |field type| mandatory           | description  |
| ------------ |:---:|:-------------:| -----:|
| account      | string |true | account |
| password     | string |true      |   key |
| nickname     | string |false      |    name |
##### return JSON example
######success
```json
{
  "status": "340"
}
```
######faild
```json
{
  "status": "370"
}
```
***

#### log on
##### URL http://42.96.155.17:3000/mobile/app.login
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | field type | mandatory           | description  |
| ------------ |:-----:|:-------------:| -----:|
| account      |string| true | account |
| password     |string| true      |   key |
##### return JSON example
######success
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
##### return field description
| param        | field type | description  |
| ------------ |:-----: | -----:|
| status      |string | status code |
| userInfo     |object|   user information |
| config     |object|   configuration infromation, 融云token和七牛图片域名 |
***

#### get the new profile photo token
##### URL http://42.96.155.17:3000/mobile/app.changeavatar
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| account      | true | account |
##### return JSON example
######success
```json
{
  "status": "700",
  "token": "hXxhiug5AmKnXTSGECNFWy2Bo0QRzrDqo7bst8rS:SWEYEPGoBDsCXv2KS7H51XZkr5w=:eyJzY29wZSI6ImZhdGhlcmJvb2s6dXNlckF2YXRhci90ZXN0LmpwZWciLCJkZWFkbGluZSI6MTQ2NjQ5MTE5M30=",
  "filename": "userAvatar/test.jpeg"
}
```
##### return field description
| param        |field type| description  |
| ------------ |:-----: | -----:|
| status      |string | status code |
| token      |string | 七牛upload photo need：token |
| filename      |string | 七牛upload photo need： key |
***

#### send profile photo to 七牛 successfully
##### URL http://42.96.155.17:3000/mobile/app.changeavatar.success
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| account      | true | account |
##### return JSON example
######success
```json
{
  "status": "720",
  "filename": "userAvatar/test.jpeg"
}
```
##### return field description
| param        |field type| description  |
| ------------ |:-----: | -----:|
| status      |string | status code |
| filename      |string | picture filename |
***

#### get融云token
##### URL http://42.96.155.17:3000/mobile/app.rongcloud.token
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| account      | true | account |
##### return JSON example
######success
```json
{
  "status": "100",
  "rcToken": "5PKj9sQXS+OUrTVqMKTsJFfPZNc7xXj1I/NyOPG8O5wGaZzJ1dNLLabF9NTxrj1oPJlAzlBhohfYfSkEAxGIYQ=="
}
```
##### return field description
| param        |field type| description  |
| ------------ |:-----: | -----:|
| status      |string | status code |
| rcToken      |string | 融云token |
***

#### search user
##### URL http://42.96.155.17:3000/mobile/app.search.account
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| account      | true | account |
| searchString | true | account string |
##### return JSON example
######success
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
##### return field description
| param        |field type| description  |
| ------------ |:-----: | -----:|
| status      |string | status code |
| users      |array | userInfo array |
***

#### get follow table
##### URL http://42.96.155.17:3000/mobile/app.friend.following
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| account      | true | account |
##### return JSON example
######success
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
##### return field description
| param        |field type| description  |
| ------------ |:-----: | -----:|
| status      |string | status code |
| follow_infos      |array | follower userInfo array |
***

#### follow
##### URL http://42.96.155.17:3000/mobile/app.friend.follow
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| account      | true | account |
| targetID      | true | target userID |
##### return JSON example
######success
```json
{
  "status": "500"
}
```
***

#### unfollow
##### URL http://42.96.155.17:3000/mobile/app.friend.unfollow
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| account      | true | account |
| targetID      | true | target userID |
##### return JSON example
######success
```json
{
  "status": "520"
}
```
***

#### send timeline
##### URL http://42.96.155.17:3000/mobile/app.timeline.post
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| account      | true | account |
| password      | true | key |
| text | true | timeline text content | 
| images | false | timeline picture message | 
##### return JSON example
######success
```json
{
  "success": "600",
  "_id": 8
}
```
##### return field description
| param        |field type| description  |
| ------------ |:-----: | -----:|
| status      |string | status code |
| _id      |int | timeline id |
***

#### get specific users’ all timeline
##### URL http://42.96.155.17:3000/mobile/app.timeline.get
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| account      | true | account |
##### return JSON example
######success
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
##### return field description
| param        |field type| description  |
| ------------ |:-----: | -----:|
| status      |string | status code |
| timelines      |array | timeline array |
***

#### get specific users’ all timeline
##### URL http://42.96.155.17:3000/mobile/app.timeline.getByFollowing
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| account      | true | account |
| maxID      | false | timelineID ≤maxID |
| minID      | false | timelineID ≥maxID |
| count      | false | max quantity which can get once， default：30 |
##### return JSON example
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
##### return field description
| param        |field type| description  |
| ------------ |:-----: | -----:|
| status      |string | status code |
| timelines      |array | timeline array |
***

#### timeline like
##### URL http://42.96.155.17:3000/mobile/app.timeline.like
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| account      | true | account |
| timelineID | true | timeline ID |
##### return JSON example
######success
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

#### timeline cancel like
##### URL http://42.96.155.17:3000/mobile/app.timeline.unlike
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| account      | true | account |
| timelineID | true | timeline ID |
##### return JSON example
######success
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

#### comment
##### URL http://42.96.155.17:3000/mobile/app.timeline.comment
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| account      | true | account |
| timelineID | true | timeline ID |
| content | true | comments |
##### return JSON example
######success
```json
{
  "status": "740"
}
```
***

#### get comments
##### URL http://42.96.155.17:3000/mobile/app.timeline.comment
##### supported format
###### JSON
##### HTTP request mode
###### POST
##### request parameter
| param        | mandatory           | description  |
| ------------- |:-------------:| -----:|
| timelineID | true | timeline ID |
##### return JSON example
######success
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
##### return field description
| param        |field type| description  |
| ------------ |:-----: | -----:|
| status      |string | status code |
| comments      |array | comment array |
***