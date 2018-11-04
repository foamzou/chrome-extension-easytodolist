var TaskManger = {
    list: function(isPendding, cb) {
        let key = isPendding ? 'taskList' : 'finishedTaskList';
        Util.Data.get({[key]: []}, function(data) {
            cb(data[key]);
        })
    },
    get: function(id, cb) {
        Util.Data.get({'taskList': []}, function(data) {
            for (let i=0; i<data['taskList'].length; ++i) {
                if (data['taskList'][i]['id'] == id) {
                    cb(data['taskList'][i]);
                    return;
                }
            }
        })
    },
    add: function(taskDesc, allowDeadline, deadlineDate, cb) {
        Util.Data.get({'taskList': []}, function(data) {
            data['taskList'].push({
                id: Util.uuid(),
                taskDesc,
                allowDeadline,
                deadlineDate,
            });
            Util.Data.set({'taskList': data['taskList']}, cb);
        })
    },
    del: function(id, cb) {
        Util.Data.get({'taskList': []}, function(data) {
            for (let i=0; i<data['taskList'].length; ++i) {
                if (data['taskList'][i]['id'] == id) {
                    data['taskList'].splice(i, 1);
                    Util.Data.set({'taskList': data['taskList']});
                    cb()
                    return;
                }
            }
        })
    },
    setFinish: function(id, cb) {
        const TASK_LIMIT_SIZE = 30;
        Util.Data.get({'taskList': []}, function(data) {
            for (let i=0; i<data['taskList'].length; ++i) {
                if (data['taskList'][i]['id'] == id) {
                    //delete
                    let finishedTask = data['taskList'].splice(i, 1)[0];
                    Util.Data.set({'taskList': data['taskList']});

                    //append to finished list
                    Util.Data.get({'finishedTaskList': []}, function(data) {
                        // append to head of list
                        data['finishedTaskList'].splice(0, 0, finishedTask);
                        // keep recent task size up to TASK_LIMIT_SIZE
                        data['finishedTaskList'] = data['finishedTaskList'].slice(0, TASK_LIMIT_SIZE)
                        Util.Data.set({'finishedTaskList': data['finishedTaskList']}, cb);
                    });
                    return;
                }
            }
        })
    },
    rollback: function(id, cb) { // 从已完成撤回到进行中
        Util.Data.get({'finishedTaskList': []}, function(data) {
            for (let i=0; i<data['finishedTaskList'].length; ++i) {
                if (data['finishedTaskList'][i]['id'] == id) {
                    //delete
                    let rollbackTask = data['finishedTaskList'].splice(i, 1)[0];
                    Util.Data.set({'finishedTaskList': data['finishedTaskList']});

                    //append to pendding list
                    Util.Data.get({'taskList': []}, function(data) {
                        data['taskList'].push(rollbackTask);
                        Util.Data.set({'taskList': data['taskList']}, cb);
                    });
                    return;
                }
            }
        })
    },
    update: function(id, taskDesc, allowDeadline, deadlineDate, cb) {
        Util.Data.get({'taskList': []}, function(data) {
            for (let i=0; i<data['taskList'].length; ++i) {
                if (data['taskList'][i]['id'] == id) {
                    data['taskList'][i] = {
                        id,
                        taskDesc,
                        allowDeadline,
                        deadlineDate,
                    }
                    Util.Data.set({'taskList': data['taskList']}, cb);
                    return;
                }
            }
        })
    },
}