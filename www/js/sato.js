var changeId = function(){
}
var id = setTimeout(changeId, 600);
var getLiLength = 200;
 
$(function(){
	//外部リンクにtarget blank
	$('a[href^=https]').not('[href*="'+location.hostname+'"]').attr('target', '_blank');
	//検索リセット
	$('.search-form-content-btn-reset').click(function() {
		$('input[type="checkbox"]').prop('checked', false);
		$('input[name="free"]').val('');
		$('.search-form-content input[type="hidden"]').val('');
	});
	//検索をaccordionに
	$(".motto").click(function() {
        $("#block").slideToggle(function() {
            if ($("#block").css('display') == 'block') {
                $(".motto span").text('▲');
            } else {
                $(".motto span").text('▼');
            };
        });
    });



    //リストファインダー設定
	var inputId = "frm_forminput";
	var inputText = '以下のフォームに必要事項をご⼊⼒の上、「同意して確認画面へ」を押してください。<br>ご要望・ご質問については2～3営業日以内に担当よりご連絡差し上げます。<br><br><span class="inquiry_hissu">※必須となっている項目は必ず入力してください。</span>';
	var confirmText = "";
	var thanksText = "<span style='font-size:20px;font-wight:bold;'>お申込みありがとうございました。</span><br><br>お申込みを受け付けました。<br>なお、ご入力いただいたメールアドレス宛に受付完了メールを配信しております。<br>完了メールが届かない場合、処理が正常に行われていない可能性がありますので、<br>大変お手数ですが、再度お申込みの手続きをお願いいたします。";

	//　お問い合わせページ
	$("form").each(function() {
		if ($(".inquiry_text")) {
			$(".inquiry .inquiry_text").html(inputText);
		}
	});

	//　お問い合わせ確認
	$(document).on("click", "#lf_form_submit_button", function(){
//        $('body, html').animate({ scrollTop: 0 }, 500);
		setTimeout(function() {
		    var getThisH1 = $(".key h1").text();
//			$(".button_area").css({ "display": "flex","margin-top":"20px"});
			$("#button_confirm_submit").attr("onClick","ga('send', 'event', 'pcsp', 'contact', '"+getThisH1+"'); this.disabled = true;");
			$(".inquiry .inquiry_text").html(confirmText);
		}, 1000);

		//　お問い合わせ完了
		const MAX_RETRY_COUNT_FIND_DIFF_CONTAINER = 100;
		var set_interval_id = setInterval(findTargetElement, 1000);
		var retry_counter = 0;
		function findTargetElement() {
		    retry_counter++;
		    // 要素がMAXリトライ値になっても見つからない場合、インターバルを削除
		    if(retry_counter > MAX_RETRY_COUNT_FIND_DIFF_CONTAINER) {
		        clearInterval(set_interval_id);
		    }
		    var diff_container_elements = $('input[value="閉じる"]');
		    if(diff_container_elements.length > 0) {
		        clearInterval(set_interval_id);
		        // やりたい処理を呼ぶ(”隠す”ボタンを設置する関数)
		        addHideBtn(diff_container_elements);
		    }       
		}

		function addHideBtn(diff_container_elements) {
//			$('body, html').animate({ scrollTop: 0 }, 500);
			$(".inquiry .inquiry_text").html(thanksText);
		}
	});
});



$(document).on('keyup', 'input[name="free"]', function(){
    $(this).val($(this).val().replace(/　/g,' '));
});


//search
$(document).ready(function(){
	search();
  var url = location.href;
  var host = location.host;
  var home = location.protocol + '//' + host + "/search/";
  if(url.indexOf(home) > -1) {
    result();
  }
});

//パラメーターセット
function search(){
	$('.all_cat input[type="checkbox"]').on('change', function(event) {
	    //メインカテゴリのチェック-------------------------------
	    all_cat_check = $('.all_cat input[type="checkbox"]:checked').map(function(){
	      return $(this).val();
	    }).get();
	    $('input[name="all_cat"]').val(all_cat_check);
    });

    $('.products_cat input[type="checkbox"]').on('change', function(event) {
	    //メインカテゴリのチェック-------------------------------
	    products_cat_check = $('.products_cat input[type="checkbox"]:checked').map(function(){
	      return $(this).val();
	    }).get();
	    $('input[name="products_cat"]').val(products_cat_check);
    });

    $('.industry_cat input[type="checkbox"]').on('change', function(event) {
	    //メインカテゴリのチェック-------------------------------
	    industry_cat_check = $('.industry_cat input[type="checkbox"]:checked').map(function(){
	      return $(this).val();
	    }).get();
	    $('input[name="industry_cat"]').val(industry_cat_check);
    });
}


function result(){

	//パラメータを取得--------------------------------------------------------------------
	//var postList = '';
	var postList_products = '';
	var postList_industry = '';
	var postList_column = '';
	var postList_seminar = '';
	var postList_training = '';
	var postList_case = '';
	var postList_news = '';
	var postList_lab = '';
	var arg  = new Object;
	url = location.search.substring(1).split('&');

	for(i=0; url[i]; i++) {
	    var k = url[i].split('=');
	    arg[k[0]] = k[1];
	}
	//各ワードを配列に格納-----------------------------------------------------------------
	var free = '';
	var Sfree = '';
	var all_cat = '';
	var products_cat = '';
	var industry_cat = '';
	if(arg.free != undefined){
		free = decodeURIComponent(arg.free.toLowerCase()).split("+");
		//キーワード
		free = free.filter(Boolean);
	}
	if(arg.all_cat != undefined){
		//全体カテゴリ
		all_cat = decodeURIComponent(arg.all_cat.toLowerCase()).split(",");
	}
	if(arg.products_cat != undefined){
		//製品カテゴリ
		products_cat = decodeURIComponent(arg.products_cat.toLowerCase()).split(",");
	}
	if(arg.industry_cat != undefined){
		//業種・⽤途
		industry_cat = decodeURIComponent(arg.industry_cat.toLowerCase()).split(",");
	}
	//各ワードを検索検索フォームに入れ込み-----------------------------------------------------
	if(arg.free){
		Sfree = free.join(' ');
	}
	//フリーワード
	$('input[name="free"]').val(Sfree);
	//全体カテゴリ
	if(arg.all_cat != undefined || arg.products_cat != undefined || arg.industry_cat != undefined){
		$(".motto span").text('▲');
		$("#block").css('display','block');
	}
	


	$('.all_cat input').each(function(index, element) {
      var check_val = $(this).val().toLowerCase();
      //一致したcheckboxにcheck
      if($.inArray(check_val, all_cat) != -1){
        $(this).prop('checked', true);
      }else{
        //一致していないものを外す
        $(this).prop('checked', false);
      }

    });
    //製品カテゴリ
	$('.products_cat input').each(function(index, element) {
      var check_val = $(this).val().toLowerCase();
      //一致したcheckboxにcheck
      if($.inArray(check_val, products_cat) != -1){
        $(this).prop('checked', true);
      }else{
        //一致していないものを外す
        $(this).prop('checked', false);
      }
    });
    //業種
	$('.industry_cat input').each(function(index, element) {
      var check_val = $(this).val().toLowerCase();
      //一致したcheckboxにcheck
      if($.inArray(check_val, industry_cat) != -1){
        $(this).prop('checked', true);
      }else{
        //一致していないものを外す
        $(this).prop('checked', false);
      }
    });
	//hiddenに格納----------------------------------------------------------
    //メインカテゴリのチェック-------------------------------
    all_cat_check = $('.all_cat input[type="checkbox"]:checked').map(function(){
      return $(this).val();
    }).get();
    $('input[name="all_cat"]').val(all_cat_check);

    //メインカテゴリのチェック-------------------------------
    products_cat_check = $('.products_cat input[type="checkbox"]:checked').map(function(){
      return $(this).val();
    }).get();
    $('input[name="products_cat"]').val(products_cat_check);

    //メインカテゴリのチェック-------------------------------
    industry_cat_check = $('.industry_cat input[type="checkbox"]:checked').map(function(){
      return $(this).val();
    }).get();
    $('input[name="industry_cat"]').val(industry_cat_check);

	//jsonループ--------------------------------------------------------------------------
/*

◆検索結果を増やす方法

▼検索ボタン
全体カテゴリ	all_cat
製品カテゴリ	products_cat
業種・用途	industry_cat
文字検索	free

▼検索対象
data.item[i].title
data.item[i].body
data.item[i].cat
data.item[i].product_name
data.item[i].CatTag
data.item[i].area
data.item[i].seminarTag
data.item[i].industrytag

検索結果としてかかったものを表示させるには、
「検索ボタン」で追加したボタンの位置を追加し、
検索対象を指定し、
一致した場合はtrueを指定する。

◆例：全体カテゴリにWEBセミナーを追加する
「全体カテゴリ」に「WEBセミナー」ボタンを追加。
「セミナータグ」に「WEBセミナー」を追加。
＝
「all_cat」と「seminarTag」を比較し、一致した場合はtrueにした。

*/
	$.when(
	    //$("#result_technology").html(""),
	    $.getJSON("../post.js", function(data) {
	    	//jsonのループ
	    	for (var i = 0; i < data.item.length; i++) {
	    		var post_match = false;
	    		//記事の出力の関数
	    		function post_true(){
    				//記事ここから
    				var post_url = data.item[i].url;
    				var seminarTag = data.item[i].seminarTag.split(",");
					var area = data.item[i].area.split(",");
					var catTag = data.item[i].CatTag.split(",");
					var product_name = data.item[i].product_name.split(",");
					var industrytag = data.item[i].industrytag.split(",");
					var post_icon = '';
					var thum = '';
					var seminarDate = data.item[i].seminar_date;
					var seminarEnd = data.item[i].seminar_end;

					//セミナー日の日付変更
					if(seminarDate != undefined){
					var dt = new Date();
					var y = dt.getFullYear();
					var m = ("00" + (dt.getMonth()+1)).slice(-2);
					var d = ("00" + dt.getDate()).slice(-2);
					var today_fin = y + "/" + m + "/" + d;
					var today = new Date(today_fin);
					  seminarDate = seminarDate.replace(/ /g, '');
					  seminarDate = seminarDate.replace(/年1月/g, '年01月').replace(/年2月/g, '年02月').replace(/年3月/g, '年03月');
					  seminarDate = seminarDate
					  .replace(/月1日/g, '月01日')
					  .replace(/月2日/g, '月02日')
					  .replace(/月3日/g, '月03日')
					  .replace(/月4日/g, '月04日')
					  .replace(/月5日/g, '月05日')
					  .replace(/月6日/g, '月06日')
					  .replace(/月7日/g, '月07日')
					  .replace(/月8日/g, '月08日')
					  .replace(/月9日/g, '月09日')
					  seminarDate = seminarDate.replace(/年/g, '/').replace(/月/g, '/').replace(/日/g, '');
					  seminarDate = new Date(seminarDate);
					  var termDay = (today - seminarDate) / 86400000;
					  //開催間近か検証
					  if(termDay < 0 && termDay > -30){
					    post_icon += '<span class="guide_cat listBox-cat listBox-cat05">開催間近</span>'
					  }
					  //開催が過ぎたか検証
					  if(termDay > 0){
					    post_icon += '<span class="guide_cat listBox-cat listBox-cat05">開催終了</span>'
					  }
					}
					if(seminarEnd != undefined){
					var dt = new Date();
					var y = dt.getFullYear();
					var m = ("00" + (dt.getMonth()+1)).slice(-2);
					var d = ("00" + dt.getDate()).slice(-2);
					var today_fin = y + "/" + m + "/" + d;
					var today = new Date(today_fin);
					  //セミナー日の日付変更
					  seminarEnd = seminarEnd.replace(/ /g, '');
					  seminarEnd = seminarEnd.replace(/年1月/g, '年01月').replace(/年2月/g, '年02月').replace(/年3月/g, '年03月');
					  seminarEnd = seminarEnd
					  .replace(/月1日/g, '月01日')
					  .replace(/月2日/g, '月02日')
					  .replace(/月3日/g, '月03日')
					  .replace(/月4日/g, '月04日')
					  .replace(/月5日/g, '月05日')
					  .replace(/月6日/g, '月06日')
					  .replace(/月7日/g, '月07日')
					  .replace(/月8日/g, '月08日')
					  .replace(/月9日/g, '月09日')
					  seminarEnd = seminarEnd.replace(/年/g, '/').replace(/月/g, '/').replace(/日/g, '');
					  seminarEnd = new Date(seminarEnd);
					  var termDay2 = (today - seminarEnd) / 86400000;
					  //募集中か検証
					  // if(seminarEnd != '' && termDay2 <= 0){
					  //   post_icon += '<a class="listBox-cat listBox-cat05">募集中</a>'
					  // }
					  //募集終了か検証
					  if(seminarEnd != '' && termDay2 > 0){
					    post_icon += '<span class="guide_cat listBox-cat listBox-cat05">募集終了</span>'
					  }
					}
					// if(seminarDate != undefined||seminarEnd != undefined){
					//   //常時募集中か検証
					//   if(seminarEnd == '' && termDay < 0){
					//     post_icon += '<a class="listBox-cat listBox-cat05">常時募集中</a>'
					//   }
					// }

					if(seminarTag[0] != null){
						for (var h = 0; h < seminarTag.length; h++) {
							if(seminarTag[h] != ''){
								post_icon += '<span class="guide_cat listBox-cat listBox-cat01">' + seminarTag[h] + '</span>'
							}
						};
					}
					// if(area[0] != null){
					// 	for (var h = 0; h < area.length; h++) {
					// 		if(area[h] != ''){
					// 			post_icon += '<span class="guide_cat listBox-cat listBox-cat03">' + area[h] + '</span>'
					// 		}
					// 	};
					// }
					if(catTag[0] != null){
						for (var h = 0; h < catTag.length; h++) {
							if(catTag[h] != ''){
								post_icon += '<span class="guide_cat listBox-cat listBox-cat02">' + catTag[h] + '</span>'
							}
						};
					}
					if(product_name[0] != null){
						for (var h = 0; h < product_name.length; h++) {
							if(product_name[h] != ''){
								//post_icon += '<a class="listBox-cat listBox-cat02" href="/search/?free=' + product_name[h] + '">' + product_name[h] + '</a>'
								post_icon += '<span class="guide_cat listBox-cat listBox-cat02">' + product_name[h] + '</span>'
							}
						};
					}
					// if(industrytag[0] != null){
					// 	for (var h = 0; h < industrytag.length; h++) {
					// 		if(industrytag[h] != ''){
					// 			//post_icon += '<a class="listBox-cat listBox-cat02" href="/search/?free=' + industrytag[h] + '">' + industrytag[h] + '</a>'
					// 			post_icon += '<span class="guide_cat listBox-cat listBox-cat02">' + industrytag[h] + '</span>'
					// 		}
					// 	};
					// }
					if(data.item[i].thum != ''){
						thum = data.item[i].thum;
					}else{
						thum = '/img/common/noimg.jpg';
					}
					//製品の記事を代入
					if (post_url.indexOf('/products/') >= 0) {
						postList_products += '<article class="guide_item"><a href="' + data.item[i].url + '" tabindex="0"><h2 class="guide_ttl">' + data.item[i].title + '</h2>' + post_icon + '<figure class="guide_img"><picture><img src="' + thum + '" alt=""></picture></figure><p class="guide_text">' + data.item[i].excerpt +'</p></a></article>';
					}
					//事例の記事を代入
					if (post_url.indexOf('/case_list/') >= 0) {
						postList_case += '<article class="guide_item"><a href="' + data.item[i].url + '" tabindex="0"><h2 class="guide_ttl">' + data.item[i].title + '</h2>' + post_icon + '<figure class="guide_img"><picture><img src="' + thum + '" alt=""></picture></figure><p class="guide_text">' + data.item[i].excerpt +'</p></a></article>';
					}
					//技術コラムの記事を代入
					if (post_url.indexOf('/column/') >= 0) {
						postList_column += '<article class="guide_item"><a href="' + data.item[i].url + '" tabindex="0"><h2 class="guide_ttl">' + data.item[i].title + '</h2>' + post_icon + '<figure class="guide_img"><picture><img src="' + thum + '" alt=""></picture></figure><p class="guide_text">' + data.item[i].excerpt +'</p></a></article>';
					}
					//セミナーの記事を代入
					if (post_url.indexOf('/event_seminar/') >= 0) {
						postList_seminar += '<article class="guide_item"><a href="' + data.item[i].url + '" tabindex="0"><h2 class="guide_ttl">' + data.item[i].title + '</h2>' + post_icon + '<figure class="guide_img"><picture><img src="' + thum + '" alt=""></picture></figure><p class="guide_text">' + data.item[i].excerpt +'</p></a></article>';
					}
					//ニュースの記事を代入
					if (post_url.indexOf('/news/') >= 0) {
						postList_news += '<article class="guide_item"><a href="' + data.item[i].url + '" tabindex="0"><h2 class="guide_ttl">' + data.item[i].title + '</h2>' + post_icon + '<figure class="guide_img"><picture><img src="' + thum + '" alt=""></picture></figure><p class="guide_text">' + data.item[i].excerpt +'</p></a></article>';
					}
					//トレーニングの記事を代入
					if (post_url.indexOf('/training/') >= 0) {
						postList_training += '<article class="guide_item"><a href="' + data.item[i].url + '" tabindex="0"><h2 class="guide_ttl">' + data.item[i].title + '</h2>' + post_icon + '<figure class="guide_img"><picture><img src="' + thum + '" alt=""></picture></figure><p class="guide_text">' + data.item[i].excerpt +'</p></a></article>';
					}
					//SBD利用技術研究会の記事を代入
					if (post_url.indexOf('/lab/') >= 0) {
						postList_lab += '<article class="guide_item"><a href="' + data.item[i].url + '" tabindex="0"><h2 class="guide_ttl">' + data.item[i].title + '</h2>' + post_icon + '<figure class="guide_img"><picture><img src="' + thum + '" alt=""></picture></figure><p class="guide_text">' + data.item[i].excerpt +'</p></a></article>';
					}
					//業種カテゴリの記事を代入
					if (post_url.indexOf('/industry/') >= 0) {
						postList_industry += '<article class="guide_item"><a href="' + data.item[i].url + '" tabindex="0"><h2 class="guide_ttl">' + data.item[i].title + '</h2>' + post_icon + '<figure class="guide_img"><picture><img src="' + thum + '" alt=""></picture></figure><p class="guide_text">' + data.item[i].excerpt +'</p></a></article>';
					}
    			}
    			//各検索の判定、OK=true NG=false
    			var post_match_flag = false;
    			var post_match_free = true;
    			//キーワードの一致判定のループ
    			if(free[0] != undefined){
	    			for (var j = 0; j < free.length; j++) {
		    			if ((data.item[i].title.toLowerCase().replace(/\s+/g, "")).indexOf(free[j].replace(/\s+/g, "")) >= 0) {
		    				post_match_flag = true;
		    				post_match_free = true;
		    				break;
		    			}else if ((data.item[i].body.toLowerCase().replace(/\s+/g, "")).indexOf(free[j].replace(/\s+/g, "")) >= 0) {
		    				post_match_flag = true;
		    				post_match_free = true;
		    				break;
		    			}else if ((data.item[i].cat.toLowerCase().replace(/\s+/g, "")).indexOf(free[j].replace(/\s+/g, "")) >= 0) {
		    				post_match_flag = true;
		    				post_match_free = true;
		    				break;
		    			}else if ((data.item[i].product_name.toLowerCase().replace(/\s+/g, "")).indexOf(free[j].replace(/\s+/g, "")) >= 0) {
		    				post_match_flag = true;
		    				post_match_free = true;
		    				break;
		    			}else if ((data.item[i].CatTag.toLowerCase().replace(/\s+/g, "")).indexOf(free[j].replace(/\s+/g, "")) >= 0) {
		    				post_match_flag = true;
		    				post_match_free = true;
		    				break;
		    			}else if ((data.item[i].area.toLowerCase().replace(/\s+/g, "")).indexOf(free[j].replace(/\s+/g, "")) >= 0) {
		    				post_match_flag = true;
		    				post_match_free = true;
		    				break;
		    			}else if ((data.item[i].seminarTag.toLowerCase().replace(/\s+/g, "")).indexOf(free[j].replace(/\s+/g, "")) >= 0) {
		    				post_match_flag = true;
		    				post_match_free = true;
		    				break;
		    			}else if ((data.item[i].industrytag.toLowerCase().replace(/\s+/g, "")).indexOf(free[j].replace(/\s+/g, "")) >= 0) {
		    				post_match_flag = true;
		    				post_match_free = true;
		    				break;
		    			}else{
		    				post_match_flag = false;
		    				post_match_free = false;
		    			}
		    		};
		    	}

		    	var post_match_all_cat = true;
		    	if(all_cat[0] != undefined){
	    			for (var j = 0; j < all_cat.length; j++) {
	    				//console.log(data.item[i].title + data.item[i].cat + all_cat[j]);
		    			if ((data.item[i].seminarTag.toLowerCase().replace(/\s+/g, "")).indexOf(all_cat[j].replace(/\s+/g, "")) >= 0) {
			    				post_match_flag = true;
			    				post_match_all_cat = true;
			    				break;
		    			} else {
			    			if ((data.item[i].cat.toLowerCase().replace(/\s+/g, "")).indexOf(all_cat[j].replace(/\s+/g, "")) >= 0) {
			    				post_match_flag = true;
			    				post_match_all_cat = true;
			    				break;
			    			}else{
			    				post_match_flag = false;
			    				post_match_all_cat = false;
			    			}
		    			}

		    		};
		    	}

		    	var post_match_products_cat = true;
		    	if(products_cat[0] != undefined){
	    			for (var j = 0; j < products_cat.length; j++) {
	    				if ((data.item[i].cat.toLowerCase().replace(/\s+/g, "")).indexOf(products_cat[j].replace(/\s+/g, "")) >= 0) {
		    				post_match_flag = true;
		    				break;
		    			}else if ((data.item[i].CatTag.toLowerCase().replace(/\s+/g, "")).indexOf(products_cat[j].replace(/\s+/g, "")) >= 0) {
		    				post_match_flag = true;
		    				post_match_products_cat = true;
		    				break;
		    			}else{
		    				post_match_flag = false;
		    				post_match_products_cat = false;
		    			}
		    		};
		    	}

		    	var post_match_industry_cat = true;
		    	if(industry_cat[0] != undefined){
	    			for (var j = 0; j < industry_cat.length; j++) {
	    				if ((data.item[i].cat.toLowerCase().replace(/\s+/g, "")).indexOf(industry_cat[j].replace(/\s+/g, "")) >= 0) {
		    				post_match_flag = true;
		    				post_match_industry_cat = true;
		    				break;
		    			}else if ((data.item[i].industrytag.toLowerCase().replace(/\s+/g, "")).indexOf(industry_cat[j].replace(/\s+/g, "")) >= 0) {
		    				post_match_flag = true;
		    				post_match_industry_cat = true;
		    				break;
		    			}else{
		    				post_match_flag = false;
		    				post_match_industry_cat = false;
		    			}
		    		};
		    	}
		    	//console.log(data.item[i].title + data.item[i].cat);
	    		if(post_match_flag == true && post_match_free == true && post_match_all_cat == true && post_match_products_cat == true && post_match_industry_cat == true){
	    			post_true();
	    		}
	    	};
		})
	).done(function(){
		//console.log('・製品' + postList_products +　'・業種' + postList_industry +　'・コラム' + postList_column +　'・セミナー' + postList_seminar +　'・トレーニング' + postList_training +　'・事例' + postList_case +　'・事例' + postList_news +　'・SBD利用技術研究会' + postList_lab );
		if(postList_products == '' && postList_industry == '' && postList_column == '' && postList_seminar == '' && postList_training == '' && postList_case == '' && postList_news == '' && postList_lab == ''){
			$('.guide_list_wrap').append('<p style="text-align:center;width:100%;margin-top:-30px;">お探しの記事はございませんでしたので、再度条件を設定して下さい。</p>');
		}
		if(postList_products != ''){
			$('.guide_list_wrap').append('<h2 class="contents_borderTtl">製品</h2><div class="guide_list listBox-noDate">' + postList_products + '</div>');
		}
		if(postList_industry != ''){
			$('.guide_list_wrap').append('<h2 class="contents_borderTtl">業種・用途</h2><div class="guide_list listBox-noDate">' + postList_industry + '</div>');
		}
		if(postList_seminar != ''){
			$('.guide_list_wrap').append('<h2 class="contents_borderTtl">イベント・セミナー</h2><div class="guide_list">' + postList_seminar + '</div>');
		}
		if(postList_case != ''){
			$('.guide_list_wrap').append('<h2 class="contents_borderTtl">事例</h2><div class="guide_list listBox-noDate">' + postList_case + '</div>');
		}
		if(postList_news != ''){
			$('.guide_list_wrap').append('<h2 class="contents_borderTtl">ニュース/プレスリリース</h2><div class="guide_list">' + postList_news + '</div>');
		}
		if(postList_training != ''){
			$('.guide_list_wrap').append('<h2 class="contents_borderTtl">トレーニング</h2><div class="guide_list listBox-noDate">' + postList_training + '</div>');
		}
		if(postList_lab != ''){
			$('.guide_list_wrap').append('<h2 class="contents_borderTtl">SBD利用技術研究会</h2><div class="guide_list listBox-noDate">' + postList_lab + '</div>');
		}
		if(postList_column != ''){
			$('.guide_list_wrap').append('<h2 class="contents_borderTtl">技術コラム</h2><div class="guide_list listBox-noDate">' + postList_column + '</div>');
		}
		//$('.listBox-noDate').append(postList);
    //10件ずつ表示
    $("#searchList li").hide();

    if($("#searchList li").length < 10 ){
    	$("#moreBtn").hide();
    }
    for(i=0; i < getLiLength/2; i++){
	    $("#searchList li").eq(i).show();
    }

		$("#moreBtn").click( function(){
		    $("#searchList li").each( function(){
		    	if($(this).index() <= getLiLength ){
			    	$(this).show(0, function(){
					    if($("#searchList li").length <= getLiLength ){
					    	$("#moreBtn").hide(0);
					    }
			    	});
		    	}
		    });
		    getLiLength = getLiLength + 10;
		});
	});
}


$(document).on('click', '#lf_form_submit_button', function() {
	setTimeout(function(){
		//$(window).scrollTop($('#frm_forminput').position().top);
		//$(window).scrollTop($('body').position().top);
		$("html,body").animate({scrollTop:$('body').offset().top});
	},500);
});
$(document).on('click', '#button_confirm_submit', function() {
	setTimeout(function(){
		//$(window).scrollTop($('#frm_forminput').position().top);
		//$(window).scrollTop($('body').position().top);
		$("html,body").animate({scrollTop:$('body').offset().top});
	},2000);
});