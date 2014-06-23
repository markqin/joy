/* ====== JOY系统 用户配置文件 ====== */

var JoyConfig = {

    // ===== 自定义参数 =====
    'defaults' : {
        'filePath' : 'files/', // 文件所在的文件夹位置（相对于数据要展示的页面）
        'targetClass' : '.box', // 提取的文件中的目标DOM的class
        'dataWrapTpl' : '<div class="feed"><div class="feed-inner"><ul></ul></div></div>', // 自定义数据包裹层
        'dataShowSelector' : '.feed>.feed-inner>ul', // 根据上面的模板选择器来填写（一定要用子元素选择器“>”，防止选择范围过大而不准确）
        'cssLinks' : [ // 文件需要的css路径（相对于数据要展示的页面）
            'files/a.css',
            'files/b.css'
        ]
    },

    // ===== 分类配置 =====
    // 
    // 格式：
    // { 分类名 : 此分类的说明文字 }

    'filesClass' : {
        'normal' : '默认feeds',
        'passiv' : '被动feeds',
        'self' : '主动feeds',
        'original' : '原创feeds'
    },


    // ===== 文件配置 =====
    // 
    // 默认格式：
    // { fileName:'XXX', fileTitle:'XXX', fileClass:'XXX', tags:'XXX' }
    // 
    // 解释：
    // fileName: 文件名，即xxx.html中的xxx（必须!没文件加载个毛啊!!!）
    // fileTitle: 这个文件的说明文字
    // fileClass: 这个文件属于哪个分类，每个文件只属于一个分类。（使用分类配置中的分类，如果有新分类，最好在‘分类配置’中添加相应的分类后再使用）
    // tags: 某些文件之间有相同的属性，比如都是属于音乐类，那就都使用‘music’标签（可多个标签，用英文分号“,”分开）

    'files' : [
        { fileName:'f-music', fileTitle:'音乐feed', fileClass:'normal', tags:'music' },
        { fileName:'f-video', fileTitle:'原创视频feed', fileClass:'newnew', tags:'video' },
        { fileName:'f-photo', fileTitle:'图片feed', fileClass:'self', tags:'picture,bbb' },
        { fileName:'f-passiv', fileTitle:'被动feed', fileClass:'passiv', tags:'haha' },
        { fileName:'a1', fileTitle:'主动音乐feed', fileClass:'self', tags:'music' },
        { fileName:'a2', fileTitle:'', fileClass:'original', tags:'picture' },
        { fileName:'a3', fileTitle:'你好视频', fileClass:'passiv', tags:'video,haha' },
        { fileName:'a4', fileTitle:'吃饭', fileClass:'', tags:'video' }
    ]

}