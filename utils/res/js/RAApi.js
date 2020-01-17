/**
 * Created by Sugar on 2017/4/14.
 */
/**
 * 查询商机
 * @param callback
 */
function GetFurnitureBusiness(callback) {
  client.query("select Id,Name,phone__c,address__c,state__c,Remarks__c from FurnitureBusiness__c where id = 'a0K28000006ogvF'", function (data) {
    console.log("获取商机成功", data);
    callback(data);
  }, function (error) {
    console.log("获取商机失败", error);
  });
}

/**
 * 创建
 * @param customer
 * @param callback
 */
function CreatePotentialCustomers(customer, callback) {
  client.create("Lead", customer, function (data) {
    console.log("创建潜在客户成功", data);
    callback(data);
  }, function (error) {
    console.log("创建潜在客户失败", error);
  });
}


/**
 * 更新商机
 * @param id
 * @param updateObj
 * @param callback
 */
function updateFurnitureBusiness(id, updateObj, callback) {
  client.update("FurnitureBusiness__c", id, updateObj, function (data) {
    console.log("更新商机成功", data);
    callback(id);
  }, function (error) {
    console.log("更新商机失败", error);
  });
}


/**
 * 创建附件
 */
function createAttach(id, base64, callback) {
	//var files = $("#uploader")[0].files;
  var obj = {
    ParentId: id,
    Name: "附件：" + new Date().getTime(),
    ContentType: "image/jpeg",
    Body: base64.split(",")[1]
  };
  client.create("attachment", obj, function (data) {
    console.log("上传名片图片附件成功", data);
    if (data.success) {
      callback(data.id);
    }
  }, function (error) {
    console.log("上传名片图片附件失败", error);
    $.hideLoading();
    $.alert("上传图片失败,请重试");
  });
}


/**
 * 查询附件
 */
function GetCardAttach(id, callback) {
  client.query("select Id,Body,Name from Attachment where ParentId= '" + id + "'", function (data) {
    console.log("获取商机附件成功", data);	
	console.log(data.totalSize);
    var body = data.records;
    for (var i = 0; i < body.length; i++) {
      (function (i) {
        AjaxGetBlob(data.records[i].Id, client.instanceUrl + body[i].Body, function (url) {
          callback(url);
        });
      })(i)
    }
  }, function (error) {
    console.log("获取商机附件失败", error);
  });
}


/**
 * 获取附件
 */
function AjaxGetBlob(id, URL, callback) {
  var url = URL;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);//get请求，请求地址，是否异步
  xhr.responseType = "blob";
  xhr.setRequestHeader("Authorization", "Bearer " + context.SessionId);
  xhr.onload = function () {
    if (this.status == 200) {
      var blob = this.response;
      blobToDataURL(id, blob, function (result) {
        callback(result);
      });
    }
  };
  xhr.send();
}

/**
 * 删除附件
 * @param id
 * @param callback
 */
function deleteAttach(id, callback) {
  client.del("Attachment", id, function (data) {
    console.log("删除附件成功", data);
    if (typeof callback == "function") {
      callback();
    }
  }, function (error) {
    console.log("删除附件失败", error);
  })
}


/**
 * blob to dataURL
 * @param blob
 * @param callback
 */
function blobToDataURL(id, blob, callback) {
  var a = new FileReader();
  a.onload = function (e) {
    callback(e.target.result);
  };
  a.readAsDataURL(blob);
}