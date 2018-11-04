layui.use(['layer', 'form', 'laydate', 'element'], function(){
  var layer = layui.layer
  ,form = layui.form
  ,laydate = layui.laydate
  ,element = layui.element;

  var log = chrome.extension.getBackgroundPage().console.log;
  var $ = layui.$;

  Util.Data.get({helloTipList: '又是元气满满的一天呢'}, function(items) {
    var tip = '';
    var tipList = items.helloTipList.split("\n");
    
    if (tipList.length > 0) {
      tip = tipList[Util.random(0, tipList.length - 1)];
    }
		$('#hi-tip').html(tip);
  });

  //----------------------------------------------

  $('#btn-open-task-window').on('click', function() {
    layer.open({
      title: '添加任务',
      type: 1,
      area: '480px'
      ,offset: 'auto' // see: http://www.layui.com/doc/modules/layer.html#offset
      ,id: 'layer-add-task' //防止重复弹出
      ,content: $('#add-task-window')
      ,btn: '确定'
      ,btnAlign: 'c' //btn align center
      ,closeBtn: 1 //style of close btn
      ,shade: 0.6 //遮罩层透明度
      ,yes: function(){
        if (!$('#input-task-desc').val()) {
          layer.msg('喂，任务描述没填哦~', {time: 1500});
          return;
        }
        Util.log('yes');
        // save task
        TaskManger.add(
          $('#input-task-desc').val(),
          $('#input-allow-deadline').is(":checked"),
          $('#input-date').val(),
          function() {
            form.render();
            loadTaskList();
          }
        );
        layer.closeAll();
      }
    });

    // clear input
    $('#input-task-desc').val('');
    $('#input-date').val('');
    $('#input-allow-deadline').prop("checked", false)
    $('#input-date-group').css('display','none');
    form.render();
  });

  form.on('switch(input-allow-deadline)', function(data){
    if ($('#input-allow-deadline').is(":checked")) {
      $('#input-date-group').css('display','block');
    } else {
      $('#input-date-group').css('display','none');
    }
  });

  // --------- init date component ----
  var laydate = layui.laydate;
  laydate.render({
    elem: '#input-date',
    type: 'datetime',
    value: 'today',
  });

  // ------------ function ---------------
  const init = () => {
    loadTaskList();
  }

  const loadTaskList = () => {
    // ------------------  pendding task list
    $("#task-list-pendding").html('');
    TaskManger.list(true, function(taskList) {Util.log(taskList);
        if (taskList.length == 0) {
          $("#task-list-pendding").html('<span style="color:#A0A0A0">你没有进行中的任务哦~</span>');
        }
        for (i=0;i<taskList.length;i++) {
          let id = taskList[i]['id'];
          let desc = taskList[i]['taskDesc'];
          let deadlineDate = taskList[i]['allowDeadline'] ? taskList[i]['deadlineDate'] : '无特定时间';
          if (deadlineDate.indexOf('00:00:00')) {
            deadlineDate = deadlineDate.replace(' 00:00:00', '');
          }
          let item = $(`
            <div class="layui-row" style="margin-top:10px">
              <div class="layui-col-xs5 layui-col-sm5 layui-col-md5">
                <div class="grid-demo grid-demo-bg1">${desc}</div>
              </div>
              <div class="layui-col-xs4 layui-col-sm4 layui-col-md4">
                <div class="grid-demo">${deadlineDate}</div>
              </div>
              <div class="layui-col-xs1 layui-col-sm1 layui-col-md1">
                <div class="layui-btn layui-btn-xs layui-btn-radius btn-task-edit" task-id="${id}">编辑</div>
              </div>
              <div class="layui-col-xs1 layui-col-sm1 layui-col-md1">
                <div class="layui-btn layui-btn-xs layui-btn-radius layui-btn-normal btn-task-finish" task-id="${id}">完成</div>
              </div>
              <div class="layui-col-xs1 layui-col-sm1 layui-col-md1">
                <div class="layui-btn layui-btn-xs layui-btn-radius layui-btn-danger btn-task-del" task-id="${id}">删除</div>
              </div>
            </div>
            <hr class="layui-bg-gray">
          `);
          $("#task-list-pendding").append(item);
        }

        // ------ 任务按钮监听事件 --------
        $('.btn-task-del').on('click', function() {
          layer.confirm('删除后无法恢复，确定吗', {
            btn: ['确认','取消']
          }, (index) => {
              TaskManger.del($(this).attr('task-id'), () => {
                loadTaskList();
              });
              layer.close(index);
            })
        });

        //
        $('.btn-task-finish').on('click', function() {
            TaskManger.setFinish($(this).attr('task-id'), () => {
              loadTaskList();
            });
        });

        //
        $('.btn-task-edit').on('click', function() {
          let taskId = $(this).attr('task-id');
          TaskManger.get(taskId, (task) => {
            Util.log(task)
            $('#input-task-desc').val(task.taskDesc);
            $('#input-allow-deadline').prop("checked", task.allowDeadline)
            $('#input-date').val(task.deadlineDate);
            if (task.allowDeadline) {
              $('#input-date-group').css('display','block');
            } else {
              $('#input-date-group').css('display','none');
            }
            form.render();

            layer.open({
              title: '编辑任务',
              type: 1,
              area: '480px'
              ,offset: 'auto'
              ,id: 'layer-add-task' //防止重复弹出
              ,content: $('#add-task-window')
              ,btn: '确定'
              ,btnAlign: 'c' //btn align center
              ,closeBtn: 1 //style of close btn
              ,shade: 0.6 //遮罩层透明度
              ,yes: function(){
                if (!$('#input-task-desc').val()) {
                  layer.msg('喂，任务描述没填哦~', {time: 1500});
                  return;
                }
                // save task
                TaskManger.update(
                  taskId,
                  $('#input-task-desc').val(),
                  $('#input-allow-deadline').is(":checked"),
                  $('#input-date').val(),
                  function() {
                    loadTaskList();
                  }
                );
                layer.closeAll();
              }
            });
          })
        });

        //
        $('.btn-task-del').on('click', function() {
          layer.confirm('删除后无法恢复，确定吗', {
            btn: ['确认','取消']
          }, (index) => {
              TaskManger.del($(this).attr('task-id'), () => {
                loadTaskList();
              });
              layer.close(index);
            })
        });
    });
    //--------------finished task list -------------------------
    $("#task-list-finished").html('');
    TaskManger.list(false, function(taskList) {Util.log(taskList);
        if (taskList.length == 0) {
          $("#task-list-finished").html('<span style="color:#A0A0A0">你没有已完成的任务哦~</span>');
        }
        for (i=0; i<taskList.length; i++) {
          let id = taskList[i]['id'];
          let desc = taskList[i]['taskDesc'];
          let deadlineDate = taskList[i]['allowDeadline'] ? taskList[i]['deadlineDate'] : '无特定时间';
          if (deadlineDate.indexOf('00:00:00')) {
            deadlineDate = deadlineDate.replace(' 00:00:00', '');
          }
          let item = $(`
            <div class="layui-row" style="margin-top:10px">
              <div class="layui-col-xs5 layui-col-sm5 layui-col-md5">
                <div class="grid-demo grid-demo-bg1">${desc}</div>
              </div>
              <div class="layui-col-xs4 layui-col-sm4 layui-col-md4">
                <div class="grid-demo">${deadlineDate}</div>
              </div>
              <div class="layui-col-xs1 layui-col-sm1 layui-col-md1">
                <div class="layui-btn layui-btn-xs layui-btn-radius btn-task-rollback" task-id="${id}">撤回到任务列表</div>
              </div>
            </div>
            <hr class="layui-bg-gray">
          `);
          $("#task-list-finished").append(item);
        }

        // ------ 任务按钮监听事件 --------
        $('.btn-task-rollback').on('click', function() {
            TaskManger.rollback($(this).attr('task-id'), () => {
              loadTaskList();
            });
        });
    })
  }


  // ----- init ----
  init();

});
