layui.use(['layer', 'form'], function(){
	var layer = layui.layer
	,form = layui.form
	,$ = layui.jquery;
	var log = chrome.extension.getBackgroundPage().console.log;
	


	var defaultConfig = {helloTipList: '今天，也要继续努力哦', showHelloTip: true}; // 默认配置
	// 读取数据
	Util.Data.get(defaultConfig, function(items) {
		$('#hi-tip').val(items.helloTipList);
	});

	
	$('#btn-clear-data').on('click', function() {
		chrome.storage.local.clear(() => {
			chrome.storage.sync.clear(() => {
				layer.msg("清除成功", {time: 1000});
			});
		});
	});

	$('#btn-save').on('click', function() {
		var helloTipList = $('#hi-tip').val();
		Util.Data.set({helloTipList: helloTipList}, function() {
			layer.msg("保存成功", {time: 1000});
		});
	});
  });