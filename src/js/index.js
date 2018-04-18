$(function() {
    var imgNum = 0;
    var images = ["../images/loading.gif", "../images/modal-header.png", "../images/qrcode.jpg"];

    /*这里是真正的图片预加载 preload*/
    $.imgpreload(images, {
        each: function() {
            /*this will be called after each image loaded*/
            var status = $(this).data('loaded') ? 'success' : 'error';
            if (status == "success") {
                var v = (parseFloat(++imgNum) / images.length).toFixed(2);
                $(".loading-percent").html(Math.round(v * 100) + "%");
            }
        },
        all: function() {
            /*this will be called after all images loaded*/
            $(".loading-percent").html("100%");

        }
    });

    document.onreadystatechange = completeLoading;
    //加载状态为complete时移除loading效果
    function completeLoading() {
        if (document.readyState == "complete") {
            setTimeout(function() {
                $(".loading-wrapper").fadeOut(200);
            }, 100);
        }
    }
    /* 关闭关注公众号弹窗 */
    $(".modal-close").click(function() {
        $(".modal-wrapper").hide();
    });


})