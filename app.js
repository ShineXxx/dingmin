App({
  AppId:'dingadb7cdobdnqiw9gn',
  AgentId :'348121757',
  code :'code',
  domain : "https://dev.veevlink.com",
  sessionKey : "Veevlink_Actived_AppId",
  activedAgentIdSessionKey : "Veevlink_Actived_AgentId",
  keyPrefix : "Veevlink_",
  errorKey : "Veevlink_Error",
  localKey : 'Veevlink_' + 'dingadb7cdobdnqiw9gn' + "_" + '348121757',
  onLaunch(options) {
    // 第一次打开
  },
  onShow(options) {
    // 从后台被 scheme 重新打开
    // options.query == {number:1}
  },
});
