/* ====== JOY DEMO展示管理系统 ====== */
/* 一、应用场景：有相同的class，同时有多种异化样式的DOM，在同一个页面里集合展示与管理 */
/* 二、一些特征： */
/*     1、URL查看。不管是单个展示，还是集合展示，都有唯一的URL地址，方便传阅。 */
/*     2、数据智能分类。通过简单的配置，可以将数据分成若干类。 */
/*     3、支持多标签标记数据。为有相同属性的DOM打上TAG标签，可以快速找到彼此。 */
/*     4、查找方便。面对茫茫数据，可以通过导航，方便快速的查找。 */
/*     5、使用简单。别管什么逻辑了，写点简单的配置数据，DEMO就酷起来了。 */

;(function() {

    // 获得文件配置数据
    var FilesConfig = JoyConfig.files;
    var GroupConfig = JoyConfig.filesClass;
    var DefaultConfig = JoyConfig.defaults;

    // 自定义参数赋给变量，方便调用
    var D_filePath = DefaultConfig.filePath;
    var D_targetClass = DefaultConfig.targetClass;
    var D_dataWrapTpl = DefaultConfig.dataWrapTpl;
    var D_dataShowSelector = DefaultConfig.dataShowSelector;
    var D_cssLinks = DefaultConfig.cssLinks;

    // 公共变量
    var ClassObj = {};
    var TagsObj = {};
    var ClassList = [];
    var TagsList = [];
    var IsIE = !!window.ActiveXObject;
    var $DataInsert; // 数据插入点
    var $TagsDataInsert; // 相关tag标签数据插入点

    // 系统默认设置
    var JoySettings = {
        'dataShow' : '#JOY_DataShow', // 显示数据的容器ID
        'dataInfo' : '#JOY_DataInfo', // 显示数据的容器ID
        'tagsAboutShow' : '#JOY_TagsAboutShow', // 显示有相同Tag标签数据的容器ID 
        'classNav' : '#JOY_ClassNav', // 显示分类导航的容器ID
        'tagsNav' : '#JOY_TagsNav', // 显示Tag标签导航的容器ID
        'detailNav' : '#JOY_DetailNav', // 显示二级详细文件导航的容器ID 
        'noGroupName' : 'no-group' // 没有设分类的文件所使用的hash值
    };


    // 数组去重，并去掉undefined
    function getUniqueArr(arr) {
        var _newArr = [];
        var _tempObj = {};
        for(var i = 0; i < arr.length; i++){
            if(!_tempObj[arr[i]] && typeof arr[i]!='undefined'){
                _newArr.push(arr[i]);
                _tempObj[arr[i]] = 1;
            }
        }
        return _newArr;
    }

    // 得到hash值
    function getHash(location) {
        var _matches = location.toString().match(/^[^#]*(#.+)$/);
        var _hash = _matches ? _matches[1] : '';
        var _hashVal = _hash.replace(/^(#\/*)/,'')
        return _hashVal;
    }

    // 处理取得的HTML的一些结构
    function processHtml(data){
        var newData = data.replace(/<head([\s\S]*)<\/head>/,'');
        return newData;
    }

    // 解析文件配置数据
    function paresConfig(config) {
        var _classTemp = [];
        var _tagsTemp = [];

        // 全部文件默认分在一类
        ClassObj['all'] = [];

        for (var i=0; i<config.length; i++){
            var _fileName = config[i].fileName;
            var _fileTitle = config[i].fileTitle;
            var _fileClass = config[i].fileClass;
            var _fileTag = config[i].tags;
            ClassObj['all'].push([_fileName,_fileTitle]);
            _classTemp.push(_fileClass);
            if(typeof _fileTag != 'undefined'){
                _tagsTemp = _tagsTemp.concat(_fileTag.split(','))
            }
        }

        // 获得分组
        ClassList = getUniqueArr(_classTemp);
        TagsList = getUniqueArr(_tagsTemp);

    }
    paresConfig(FilesConfig);

    // 分组
    function getGroups(arr,obj,config,match) {
        for(var i=0; i<arr.length; i++) {
            var _groupName;
            if(arr[i] != '') {
                _groupName = arr[i];
            }else {
                _groupName = JoySettings.noGroupName;
            }

            obj[_groupName] = [];

            for(var j=0; j<config.length; j++) {
                if(match == 'tags') { // 支持多tag标签
                    var _tags = config[j][match];
                    if(typeof _tags != 'undefined') {
                        var _reg = new RegExp('\\b'+arr[i]+'\\b','gi');
                        if(_tags.search(_reg) != -1) {
                            obj[_groupName].push([config[j].fileName,config[j].fileTitle]);
                        }
                    }
                }else {
                    if(arr[i] == config[j][match]) {
                        obj[_groupName].push([config[j].fileName,config[j].fileTitle]);
                    }
                }
            }
        }
    }

    // 输出分类分组对象
    getGroups(ClassList,ClassObj,FilesConfig,'fileClass');

    // 输出标签分组对象
    getGroups(TagsList,TagsObj,FilesConfig,'tags');

    // 加载文件
    function loadFiles(fileName,showBox,completeFunc){
        $.ajax({
            method: 'post',
            url: D_filePath+fileName+'.html',
            dataType: 'html',
            success: function (data){
                var result = processHtml(data);
                if(!IsIE) {
                    $(result).appendTo(showBox);
                    $('body').data('datas',showBox.find(D_targetClass));
                    showBox.html('');
                    $('body').data('datas').appendTo(showBox); 
                } else { // 解决IE下data方法循环时只能记住最后一个问题
                    $(result).appendTo($('#JOY_IETemp'));
                    $('#JOY_IETemp').find(D_targetClass).appendTo(showBox)
                }
            },
            error: function () {
                console.log('异步失败')
            },
            complete: function() {
                // 加载完成后的回调函数
                if(typeof completeFunc!= 'undefined'){
                    completeFunc();
                }
            }
        })
    }

    // 处理分组文件的加载
    function loadGroup(groupName,groupObj) {
        if(groupName != '') {
            var _files = groupObj[groupName];
            if(typeof _files != 'undefined'){
                for (var i=0; i<_files.length; i++){
                    loadFiles(_files[i][0],$DataInsert);
                    // 创建二级详细导航
                    var _fileName = _files[i][0];
                    var _fileTitle = _files[i][1];
                    if(_fileTitle == '') {
                        _fileTitle = _fileName;
                    }
                    creatDetailNav(_fileName,_fileTitle);
                }
            }else {
                console.log('没有这个分组')
            }
        } else {
            console.log('无效的分组')
        }
    }

    // 根据hash值处理加载
    function route(hash){
        console.log($DataInsert)
        // 每次hash变化，每个区域都清空以前加载过的数据
        $(JoySettings.detailNav).html('');
        $(JoySettings.dataInfo).html('');
        $DataInsert.html('');
        // $(JoySettings.tagsAboutShow).html('');
        $TagsDataInsert.html('');
        $(JoySettings.tagsAboutNav).html('');
        hideTagsAboutPanel();
        // 解决IE下数据加载问题
        if(IsIE) {
            if($('#JOY_IETemp').length < 1) {
                $('body').append('<div id="JOY_IETemp" style="display:none"></div>')
            }else {
                $('#JOY_IETemp').html('');
            }
            
        }
        // 判断hash值
        if(hash != '') {
            // 如果加载的是分类
            if(hash.search(/^j-class\//) != -1) {
                var _groupName = hash.replace(/^j-class\//,'');
                loadGroup(_groupName,ClassObj);
            } else if (hash.search(/^j-tag\//) != -1){
                var _groupName = hash.replace(/^j-tag\//,'');
                loadGroup(_groupName,TagsObj);
            } else { // 如果加载的是单个文件
                var _hasFile = 0;
                var _tag;
                var _fileTitle;
                for(var i=0; i<FilesConfig.length; i++) {
                    // 判断是否有这个文件
                    if(hash == FilesConfig[i].fileName) {
                        _hasFile = 1;
                        // 记录标签名
                        _tag = FilesConfig[i].tags;
                        // 记录文件说明文字
                        _fileTitle = FilesConfig[i].fileTitle;
                    }
                }
                if(_hasFile == 1) {
                    // 如果有这个文件，则加载
                    loadFiles(hash,$DataInsert,function(){
                        // 显示这个文件的说明文字
                        if(_fileTitle != ''){
                            $(JoySettings.dataInfo).prepend('<h1 class="joy-file-title">'+_fileTitle+' :</h1>');
                        }
                        // 加载与这个文件有相同Tag标签的其它文件
                        if(typeof _tag != 'undefined' && _tag != '') {
                            // 插入相关tag标签导航容器
                            var $tagsAboutNav = $('<div class="joy-tags-about-nav">相关标签: </div>')
                            $(JoySettings.dataInfo).append($tagsAboutNav);
                            // 输出当前文件的所有tag标签
                            var _selfTagArr = _tag.split(',');
                            for(var i=0; i<_selfTagArr.length; i++){
                                $tagsAboutNav.append('<a href="#'+hash+'">'+_selfTagArr[i]+'</a>')
                            }
                        }
                    });
                    
                    
                }else {
                    console.log('没有这个文件')
                }
            }
        }
    }

    // 显示加载的数据
    function showData() {
        route(getHash(window.location));
    }

    // hash值改变后
    function hashChange(func) {
        var _docmode = document.documentMode;
        if ('onhashchange' in window && (_docmode === undefined || _docmode > 7 )) {
            window.onhashchange = func;
        } else { // IE<7不支持onhashchange，用setInterval模拟
            var _oldHref = window.location.href;
            setInterval(function() {
                var _newHref = window.location.href;
                if (_oldHref !== _newHref) {
                    var __oldHref = _oldHref;
                    _oldHref = _newHref;
                    func.call(window, {
                        'type': 'hashchange',
                        'newURL': _newHref,
                        'oldURL': _oldHref
                    });
                }
            }, 100);
        }
    }

    // 创建分组导航
    function creatGroupNav() {
        // 让预设分组放在前面
        var _Groups = [], _GroupsAll = ['all'], _GroupsNormal = [], _GroupsOthers = [], _GroupsNo = [];
        for(var i=0; i<ClassList.length; i++) {
            if(typeof ClassList[i] != 'undefined'){
                if(ClassList[i] != ''){
                    var _groupName = GroupConfig[ClassList[i]];
                    if(typeof _groupName != 'undefined'){
                        _GroupsNormal.push(ClassList[i]);
                    } else {
                        _GroupsOthers.push(ClassList[i]);
                    }
                } else {
                    _GroupsNo.push(ClassList[i]);
                }
                
            }
        }
        _Groups = _Groups.concat(_GroupsAll,_GroupsNormal,_GroupsOthers,_GroupsNo);

        // 生成分类导航链接
        var _classNavHtml = '';
        for(var i=0; i<_Groups.length; i++) {
            var _groupName;
            var _groupTitle;
            if(typeof _Groups[i] != 'undefined'){
                if(_Groups[i] != '') {
                    _groupName = _Groups[i];
                    if(_Groups[i] == 'all') {
                        _groupTitle = '全部';
                    }else {
                        _groupTitle = GroupConfig[_Groups[i]];
                    }
                    // 如果是未预设的分组，则默认用分组名作为链接的标题
                    if(typeof _groupTitle == 'undefined'){
                        _groupTitle = _Groups[i];
                    }
                } else { // 如果没有填写分类信息，则归纳到“无分类”中
                    _groupTitle = '无分类';
                    _groupName = JoySettings.noGroupName;
                }
                _classNavHtml += '<a href="#/j-class/'+_groupName+'">'+_groupTitle+'</a>';
            }
        }
        $(JoySettings.classNav).html(_classNavHtml);

        // 生成Tag标签导航
        var _tagsNavHtml = '';
        for(var i=0; i<TagsList.length; i++) {
            var _groupName;
            if(typeof TagsList[i] != 'undefined'){
                if(TagsList[i] != '') {
                    _groupName = TagsList[i];
                    _tagsNavHtml += '<a href="#/j-tag/'+_groupName+'">'+_groupName+'</a>';
                }
            }
        }
        $(JoySettings.tagsNav).html(_tagsNavHtml);

    }

    // 创建二级详细导航
    function creatDetailNav(name,title){
        var _navItem = '<a href="#/'+name+'">'+title+'</a>';
        $(_navItem).appendTo($(JoySettings.detailNav));
    }

    // 显示相关Tag标签面板
    function showTagsAboutPanel() {
        $(JoySettings.tagsAboutShow).show().css({
            'right': '0'
        })
    }

    // 隐藏相关Tag标签面板
    function hideTagsAboutPanel() {
        $(JoySettings.tagsAboutShow).hide()
    }

    // 初始化
    function init() {
        // 如果有自定义数据插入点模板，则插入这段HTML
        if(typeof D_dataWrapTpl != 'undefined'  && D_dataWrapTpl != '' && typeof D_dataShowSelector != 'undefined'  && D_dataShowSelector != '') {
            $(JoySettings.dataShow).html(D_dataWrapTpl);
            $(JoySettings.tagsAboutShow).html(D_dataWrapTpl);
            $DataInsert = $(JoySettings.dataShow).find(D_dataShowSelector);
            $TagsDataInsert = $(JoySettings.tagsAboutShow).find(D_dataShowSelector);
        } else {
            $DataInsert = $(JoySettings.dataShow);
        }

        // 载人文件的预设css
        if(typeof D_cssLinks != 'undefined'  && D_cssLinks != '') {
            var _htmlTpl = '';
            for(var i=0; i<D_cssLinks.length; i++) {
                _htmlTpl += '<link rel="stylesheet" href="'+D_cssLinks[i]+'">'
            }
            $('head').append(_htmlTpl);
        }

        // 默认执行显示数据
        showData();
        hashChange(showData);
        // 创建分组导航
        creatGroupNav();
    }

    // 执行
    $(function(){
        init();
        
        // 点击相关tag标签导航后显示相关数据
        $('body').on('click','.joy-tags-about-nav a',function(){
            $TagsDataInsert.html('');
            var $this = $(this);
            var _tag = $this.text();
            var _file = $this.attr('href').replace('#','');
            var _tagsArr = TagsObj[_tag];
            if(typeof _tagsArr != 'undefined') {
                for(var i=0; i<_tagsArr.length; i++){
                    if(_tagsArr.length > 1) {
                        if(_file != _tagsArr[i][0]) { // 不显示当前文件本身
                            loadFiles(_tagsArr[i][0],$TagsDataInsert);
                        }
                    } else { // 如果只有一个文件包含这个tag标签
                        $(JoySettings.tagsAboutShow).html('没有其它文件有此tag标签')
                    }
                }
            }
            showTagsAboutPanel();
            return false;
        })
    })


})();


























