$(function () {

  // ヘッダーminwidh用
  /*$(window).on("scroll", function(){
    $("header").css("left", -$(window).scrollLeft());
  });*/

  //トップへ戻るボタン
  var topBtn = $('#pageTopBtn');
  var trigger = 100;
  var speed = 1000;
  var easing = 'swing';
  var offset = 0;
  topBtn.hide();
  $(window).scroll(function () {
    if ($(this).scrollTop() > trigger) {
      topBtn.fadeIn();
    } else {
      topBtn.fadeOut();
    }
  });
  topBtn.click(function () {
    $('body,html').animate({
      scrollTop: offset
    }, speed, easing);
    return false;
  });

  //ページ内リンク
  var w = $(window).width();
  if (w <= 1199) {
    var headerHight = 51;
  } else {
    var headerHight = 113;
  }
  $('a[href^="#"]').click(function() {
    var speed = 400;
    var href= $(this).attr("href");
    var target = $(href == "#" || href == "" ? 'html' : href);
    var position = target.offset().top-headerHight;
    $('body,html').animate({scrollTop:position}, speed, 'swing');
    return false;
  });

  //キービジュアルスライダー http://kenwheeler.github.io/slick/
  /*
  $('.key_slide').slick({
    arrows: false,
    dots:true,
    autoplay: true,
  });
  */
 /* 202109 追記 */
  $('.key_slide').slick({
    arrows: true,
    dots:true,
    autoplay: true,
    fade: true,
    infinite: true,
    cssEase: 'linear',
    autoplaySpeed: 3000,
    speed:1000,
  });

  //導入事例・導入の流れスライダー
  $('.caseFlow_slide-inner').slick({
    arrows: false,
    dots:true,
    autoplay: true,
    fade: true,
  });


    //メニュー表示非表示
  $('.header_bottom-mainNav').hover(function() {
    if($(this).hasClass("active")){
      $(this).removeClass("active");
      $(this).children(".header_bottom-subNav").slideUp(500);
    }else{
      $('.header_bottom-mainNav').removeClass("active");
      $(".header_bottom-subNav").slideUp(500);
      $(this).addClass("active");
      $(this).children(".header_bottom-subNav").slideDown(500);
    }
  })
  //スマホナビの表示・非表示
  $('#gNav dt').click(function() {
    if($(this).parent("dl").hasClass("active")){
      $(this).parent("dl").removeClass("active");
      $(this).parent("dl").children("dd").slideUp(500);
    }else{
      $(this).parent("dl").addClass("active");
      $(this).parent("dl").children("dd").slideDown(500);
    }
  })
  $('.footer_sitemap dt').click(function() {
    if($(this).parent("dl").hasClass("active")){
      $(this).parent("dl").removeClass("active");
      $(this).parent("dl").children("dd").slideUp(500);
    }else{
      $(this).parent("dl").addClass("active");
      $(this).parent("dl").children("dd").slideDown(500);
    }
  })
  $('#navToggle').on('click', function() {
    $('.headerSp').toggleClass("active");
    if($('.headerSp').hasClass("active")){
      $('#gNav').slideDown(500);
    }else{
      $('#gNav').slideUp(500);
    }
  });

  function init() {
    // スクロールして何ピクセルでアニメーションさせるか
    var px_change = 300;

    // スクロールのイベントハンドラを登録
    window.addEventListener('scroll', function(e){
      // 変化するポイントまでスクロールしたらクラスを追加
      if ( $(window).scrollTop() > px_change ) {
        $(".header").addClass("header_small");

      // 変化するポイント以前であればクラスを削除
    } else if ( $(".header").hasClass("header_small") ) {
        $(".header").removeClass("header_small");
      }
   });
  }
  window.onload = init();

  //FAQ開閉
  $('.faq_question').click(function() {
    if($(this).parent(".faq_con").hasClass("active")){
      $(this).parent(".faq_con").removeClass("active");
      $(this).children(".plus").css("display","flex");
      $(this).children(".minus").css("display","none");
      $(this).next(".faq_answer").slideUp(500);
    }else{
      $(this).parent(".faq_con").addClass("active");
      $(this).children(".plus").css("display","none");
      $(this).children(".minus").css("display","flex");
      $(this).next(".faq_answer").slideDown(500);
    }
  })

  //解析事例開閉
  $('.product_ttl').click(function() {
    if($(this).parent(".product").hasClass("active")){
      $(this).parent(".product").removeClass("active");
      $(this).children(".plus").css("display","flex");
      $(this).children(".minus").css("display","none");
      $(this).next(".product_list").slideUp(500);
    }else{
      $(this).parent(".product").addClass("active");
      $(this).children(".plus").css("display","none");
      $(this).children(".minus").css("display","flex");
      $(this).next(".product_list").slideDown(500);
      $(this).next(".product_list").css("display","flex");
    }
  })

  $('.accordion_ttl').click(function() {
    if($(this).parent(".accordion").hasClass("active")){
      $(this).parent(".accordion").removeClass("active");
      $(this).children(".plus").css("display","flex");
      $(this).children(".minus").css("display","none");
      $(this).next(".accordion_list").slideUp(500);
    }else{
      $(this).parent(".accordion").addClass("active");
      $(this).children(".plus").css("display","none");
      $(this).children(".minus").css("display","flex");
      $(this).next(".accordion_list").slideDown(500);
    }
  })

});
