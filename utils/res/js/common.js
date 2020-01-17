/**
 * Created by Leo on 2017/9/12.
 */

/**
 * 网络过差，超过20s的友好提示
 */
function friendShow() {
  var showTips = "<div class='weui_msg hide tipsMes' id = 'tipsMes' style = 'display: block; opacity: 1;'> " +
    "<div class='weui_icon_area'><i class='icon icon-91'></i></div> " +
    "<div class='weui_text_area'> " +
    "<h2 class='weui_msg_title'>网络缓慢，可切换网络后重试</h2> " +
    "</div> " +
    "<div class='weui_opr_area'> " +
    "<p class='weui_btn_area'> " +
    "<a href='javascript:;' class='weui_btn bg-blue pop-btn'>我要重试</a> " +
    "<a href='javascript:;' class='weui_btn weui_btn_default bot-btn'>就要等待</a> " +
    "</p> " +
    "</div> " +
    "<div class='weui_extra_area'> " +
    "</div> " +
    "</div>";

  $("body").append(showTips);

  $(".pop-btn").on("click", function () {
    WeixinJSBridge.call('closeWindow');
  });

  $(".bot-btn").on("click", function () {
    $("#tipsMes").remove();
  });
}

/**
 * 调接口15s后，未返回的友好提示界面
 */
function friendlyShow() {
  var initTime = 0;
  var time = setInterval(function () {
    initTime++;
    if (initTime < 15) {
      if ($(".weui_loading").length == 0) {
        clearInterval(time);
        return;
      }
    } else if (initTime == 15) {
      if ($(".weui_loading").length > 0) {
        friendShow();
        clearInterval(time);
        return;
      } else {
        clearInterval(time);
        return;
      }
    }
    console.log(initTime);
  }, 1000);
  return true;
}


/**
 * 页面访问成功
 */
function successShow(mes) {
  $.hideLoading();
  var showMas = "<div class='weui_msg hide succShow' style = 'display: block; opacity: 1;'> " +
    "<div class='weui_icon_area animated rotateIn'><i class='icon icon-38'></i></div> " +
    "<div class='weui_text_area'> " +
    "<h2 class='weui_msg_title'>" + mes + "</h2>" +
    "</div> " +
    "<div class='weui_opr_area'> " +
    "<p class='weui_btn_area'> " +
    "<a href='javascript:;' class='weui_btn bg-blue pop-btn'>好的</a> " +
    "</p> " +
    "</div> " +
    "<div class='weui_extra_area'> " +
    "</div> " +
    "</div>";

  $("#container").hide();
  $("body").append(showMas);

  $(".pop-btn").on("click", function () {
    WeixinJSBridge.call('closeWindow');
  });
}

/**
 * 错误信息的显示
 */
var isShowErrorInfo = true; // 是否显示错误error信息
function showErrorAlert(errorMsg) {
  $.hideLoading();
  errorMsg = isShowErrorInfo ? JSON.stringify(errorMsg) : "";
  var showError = "<div class='weui_msg hide errorMes' id = 'msg1' style = 'display: block; opacity: 1;'> " +
    "<div class='weui_icon_area'><i class='weui_icon_msg weui_icon_waiting'></i></div> " +
    "<div class='weui_text_area'> " +
    "<h2 class='weui_msg_title'>网络不稳定，可稍后重试</h2> " +
    "<p class='weui_msg_desc'>" + errorMsg + "</p> " +
    "</div> " +
    "<div class='weui_opr_area'> " +
    "<p class='weui_btn_area'> " +
    "<a href='javascript:;' class='weui_btn bg-blue pop-btn'>好的</a> " +
    "</p> " +
    "</div> " +
    "<div class='weui_extra_area'> " +
    "</div> " +
    "</div>";

  $("#container").hide();
  $("body").append(showError);

  $(".pop-btn").on("click", function () {
    WeixinJSBridge.call('closeWindow');
  });
}

/**
 * 错误信息的提示方法
 */
function tips(mes) {
  var words = '<div id="tipImg" class="tipImg">' +
    '<i class="weui_icon_info_circle"></i>' + mes + '</div>';
  $('body').append(words);
  $("tipImg").css("transform", "");
  $("#tipImg").fadeIn(150);
  setTimeout(function () {
    $("#tipImg").remove();
  }, 2500);
}