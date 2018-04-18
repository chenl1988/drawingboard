(function() {
    //变量声明
    var mouseFrom = {},
        mouseTo = {},
        drawType = null,
        canvasObjectIndex = 0,
        textbox = null;
    var drawWidth = 1; //笔触宽度
    var color = "#fff"; //画笔颜色

    var cEle = document.getElementById("canvas");
    cEle.width = $(".canvasDiv").width();
    cEle.height = $(".canvasDiv").height();

    //初始化画板
    var canvas = new fabric.Canvas("canvas", {
        isDrawingMode: true /* 可以自由绘制 */ ,
        skipTargetFind: true /* 整个画板元素不能被选中 */ ,
        selectable: false /* 控件不能被选择，不会被操作 */ ,
        selection: false /* 画板显示选中 */ ,
        isTouchSupported: true /* 支持移动端 */ ,
    });

    canvas.freeDrawingBrush.color = color; //设置自由绘颜色
    canvas.freeDrawingBrush.width = drawWidth;


    /*屏幕大小 判断 图片比例
        iphone 5:320
               6:375
               6p:414
               x:375
        三星 galaxy s |||360
    */
    var divWidth = $(".canvasDiv").width();

    var scale = 0.5;
    switch (divWidth) {
        case 414:
            scale = 0.56;
            break;
    }

    fabric.Image.fromURL('../images/bg-img.jpg', function(img) {
        var oImg = img.set({ left: 0, top: 0, scaleX: scale, scaleY: scale });
        canvas.add(oImg);
    });


    //绑定画板事件
    canvas.on("mouse:down", function(options) {
        var touch = options.e.touches[0]; //获取第一个触点
        mouseFrom.x = Number(touch.pageX);
        mouseFrom.y = Number(touch.pageY);
    });
    canvas.on("mouse:up", function(options) {
        var touch = options.e.changedTouches[0]; //获取第一个触点
        mouseTo.x = Number(touch.pageX);
        mouseTo.y = Number(touch.pageY);
        drawing();
    });

    canvas.on("selection:created", function(e) {
        if (e.target._objects) {
            //多选删除
            var etCount = e.target._objects.length;
            for (var etindex = 0; etindex < etCount; etindex++) {
                canvas.remove(e.target._objects[etindex]);
            }
        } else {
            //单选删除
            if (!(e.target._element != undefined)) {
                canvas.remove(e.target);
            }
        }
        canvas.discardActiveObject(); //清楚选中框
    });

    //绑定工具事件
    $("#toolsul").find("li").on("click", function(e) {

        $(this).addClass("active").siblings().removeClass("active");
        canvas.freeDrawingBrush.color = "#098"; //$(".icon-color-black em").css("background-color");
        drawType = $(this).attr("data-type");
        canvas.isDrawingMode = false;
        if (textbox) {
            //退出文本编辑状态
            textbox.exitEditing();
            textbox = null;
        }
        if (drawType == "pen") {
            $(".color-list").hide();
            canvas.isDrawingMode = true;
        } else if (drawType == "remove") {
            $(".color-list").hide();
            canvas.selection = true;
            canvas.skipTargetFind = false;
            canvas.selectable = true;
        } else if (drawType == "color") {
            if ($(".color-list").is(":hidden")) {
                $(".color-list").fadeIn(200).css("display", "flex");
            } else {
                var ele = e.target;
                if (ele.nodeName == "DIV") {
                    var drawingColor = $(ele).attr("data-color");
                    color = drawingColor;
                    canvas.freeDrawingBrush.color = drawingColor;
                    $(".icon-color-black em").css("background-color", drawingColor);
                    $(".color-list").fadeOut(200);
                }
            }

        } else if (drawType == "base64") {
            $(".color-list").fadeOut(200);
            var imgBase64 = canvasToBase64();
            $(".upload-loading-wrapper").fadeIn(200).css("display", "flex");
        } else {
            $(".color-list").fadeOut(200);
            canvas.skipTargetFind = true; //画板元素不能被选中
            canvas.selection = false; //画板不显示选中
        }
    });

    //绘画方法
    function drawing() {
        var canvasObject = null;
        switch (drawType) {
            case "line": //直线
                canvasObject = new fabric.Line([mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y], {
                    stroke: color,
                    strokeWidth: drawWidth
                });
                break;
            case "dottedline": //虚线
                canvasObject = new fabric.Line([mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y], {
                    strokeDashArray: [3, 1],
                    stroke: color,
                    strokeWidth: drawWidth
                });
                break;
            case "circle": //正圆
                var left = mouseFrom.x,
                    top = mouseFrom.y;
                var radius = Math.sqrt((mouseTo.x - left) * (mouseTo.x - left) + (mouseTo.y - top) * (mouseTo.y - top)) / 2;
                canvasObject = new fabric.Circle({
                    left: left,
                    top: top,
                    stroke: color,
                    fill: "rgba(255, 255, 255, 0)",
                    radius: radius,
                    strokeWidth: drawWidth
                });
                break;
            case "ellipse": //椭圆
                var left = mouseFrom.x,
                    top = mouseFrom.y;
                var radius = Math.sqrt((mouseTo.x - left) * (mouseTo.x - left) + (mouseTo.y - top) * (mouseTo.y - top)) / 2;
                canvasObject = new fabric.Ellipse({
                    left: left,
                    top: top,
                    stroke: color,
                    fill: "rgba(255, 255, 255, 0)",
                    originX: "center",
                    originY: "center",
                    rx: Math.abs(left - mouseTo.x),
                    ry: Math.abs(top - mouseTo.y),
                    strokeWidth: drawWidth
                });
                break;
            case "rectangle": //长方形
                var path =
                    "M " +
                    mouseFrom.x +
                    " " +
                    mouseFrom.y +
                    " L " +
                    mouseTo.x +
                    " " +
                    mouseFrom.y +
                    " L " +
                    mouseTo.x +
                    " " +
                    mouseTo.y +
                    " L " +
                    mouseFrom.x +
                    " " +
                    mouseTo.y +
                    " L " +
                    mouseFrom.x +
                    " " +
                    mouseFrom.y +
                    " z";
                canvasObject = new fabric.Path(path, {
                    left: left,
                    top: top,
                    stroke: color,
                    strokeWidth: drawWidth,
                    fill: "rgba(255, 255, 255, 0)"
                });
                //也可以使用fabric.Rect
                break;
            case "text":
                textbox = new fabric.Textbox("", {
                    left: mouseFrom.x,
                    top: mouseFrom.y,
                    width: 150,
                    fontSize: 18,
                    borderColor: "#2c2c2c",
                    fill: color,
                    hasControls: false
                });
                canvas.add(textbox);
                textbox.enterEditing();
                textbox.hiddenTextarea.focus();
                break;
            case "remove":
                break;

            default:
                break;
        }
        if (canvasObject) {
            // canvasObject.index = getCanvasObjectIndex();
            canvas.add(canvasObject); //.setActiveObject(canvasObject)
        }
    }

    //获取画板对象的下标
    function getCanvasObjectIndex() {
        return canvasObjectIndex++;
    }

    /* 保存为base64 */
    function canvasToBase64() {
        var canvasElement = document.getElementById("canvas");
        //图片类型
        var MIME_TYPE = "image/jpeg";
        //转换成base64
        var imgURL = canvasElement.toDataURL(MIME_TYPE, 0.7);
        /* console.log(imgURL); */
        return imgURL;
    }


    $(".tip-wrapper").click(function() {
        var itemArr = $(".tip-wrapper .tip-item");
        var index = 0;
        for (var i = 0; i < itemArr.length; i++) {
            if ($(itemArr[i]).hasClass("active")) {
                index = $(itemArr[i]).index();
            }
        }
        changeTip(index);
    });
    /* 切换气泡 */
    function changeTip(index) {
        $(".tip-wrapper .tip-item").removeClass("active");
        $(".tip-wrapper .tip-item").eq(index + 1).addClass("active");
        if (index == $(".tip-wrapper .tip-item").length - 1) {
            $(".tip-wrapper").fadeOut(200);
        }
    }

    /* 关闭上传loading 弹出提交成功提示框 */
    $(".upload-loading-wrapper").click(function() {
        $(".upload-loading-wrapper").fadeOut(200);
        $(".modal-wrapper").fadeIn(200).css("display", "flex");
    });

    /* 关闭提交成功提示框 */
    $(".modal-btn").click(function() {
        $(".modal-wrapper").fadeOut(200);
    });

})();