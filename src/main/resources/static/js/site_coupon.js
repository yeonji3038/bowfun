var SITE_COUPON = function(){
	var $couopn_list;
	var $case_product_list;
	var $case_category_list;
	var page = 1;
  var $mypage_modal_coupon_list;
  
  var $detail_coupon_list;
  var detail_downloadable_coupon_count = 0;
  
  
	var init = function (){
		$couopn_list = $("#couopn_list");
		getMypageCouponList();
	};
  
  var initDetail = function() {
    
  };
  
	function getMypageCouponList(){
		$.ajax({
			type: "POST",
			url: ("/shop/mypage_coupon_list.cm"),
			dataType: "json",
			async: true,
			cache: false,
			success: function(res){
				if(res.msg === "SUCCESS"){
					$couopn_list.find("._coupon_list").html(res.html);
					$couopn_list.find("._down_coupon_btn").off("click._down_coupon_btn").on("click._down_coupon_btn",function(){
						var code = $(this).data("code");
						if(code !== ""){
							downCoupon(code);
						}
					});
					setCouponTargetDialog();
					setCouponUseDialog();
          couponTitleResponsiveFontSize('#couopn_list');
          setTimeout(couponSizeResponsive, 0);
				}else{
					alert(res.msg);
				}
			}
		});
	}

  var openCouponDownloadModal = function(prod_code){
    $(function(){
      $.ajax({
        type: 'POST',
        data: {prod_code:prod_code},
        url: ('/ajax/open_coupon_download_modal.cm'),
        dataType: 'json',
        async: false,
        cache: false,
        success: function (res) {
          if(res.msg === 'SUCCESS'){
            $.cocoaDialog.open({type : 'download_coupon', custom_popup : res.html, width :800 });
            const afterToastNode = document.createElement('div');
            const insetToastToModal = document.querySelector('.modal_download_coupon').appendChild(afterToastNode);
            insetToastToModal.className = `modal-toast tw-bottom-[20px] tw-justify-center tw-items-center tw-py-[15px] tw-px-[30px] tw-bg-[rgba(0,0,0,0.6)] tw-rounded-[4px] tw-gap-[10px] tw-fixed tw-text-white tw-text-[14px]`;
            $detail_coupon_list = $("#modal_coupon_list");
            detail_downloadable_coupon_count = res.downloadable_count;
          }else{
            alert(res.msg);
          }
        }
      });
    });
  };
  
  const toastAction = (toastMsg) => {
    const toast = document.querySelector('.modal-toast');
    toast.classList.add('show');
    toast.innerHTML = toastMsg;

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  };
  
  // 상세페이지 전체쿠폰 다운로드
  const downloadEntireCoupon = () => {
    const downloadAbleCouponList = document.querySelector('#modal_coupon_list').querySelectorAll('[class*="_coupon_down_wrap_"]');
    let downloadReadyCouponList = [];
    downloadAbleCouponList.forEach((coupon) => {
      const couponCode = coupon.dataset.code;
      downloadReadyCouponList.push(couponCode);
    });
    const totalCouponWrap = document.querySelector('.total_coupon_wrap');
    
    if (downloadReadyCouponList.length > 0) {
      $.ajax({
        type: "POST",
        url: ('/shop/entire_coupon_download.cm'),
        data: { code_list : downloadReadyCouponList },
        dataType: "json",
        async: true,
        cache: false,
        success: function (res) {
          let is_partial_fail = false;
          let totalCouponDownloadButton = '';
          let totalCouponDownloadToastMsg = '';

          $detail_coupon_list = $("#modal_coupon_list");
          res.map((res) => {
            // $couopn_list = $("#modal_coupon_list");
            $detail_coupon_list.find("._coupon_down_wrap_"+res.coupon_code).hide();

            if (res.download === "SUCCESS") {
              $detail_coupon_list.find(".btn_down_failed_wrap_" + res.coupon_code).hide();
              $detail_coupon_list.find(".btn_down_complete_wrap_"+res.coupon_code).show();
              $detail_coupon_list.find('.coupon_wrap_'+res.coupon_code).addClass('download-done').find('.sale-price-title').addClass('download-done');

              if (!is_partial_fail) {
                totalCouponDownloadButton = res.msg;
                totalCouponDownloadToastMsg = res.entireToastMsg;
              }
            } else {
              $detail_coupon_list.find(".btn_down_complete_wrap_" + res.coupon_code).hide();
              $detail_coupon_list.find(".btn_down_failed_wrap_" + res.coupon_code).show();
              $detail_coupon_list.find(".coupon_wrap_" + res.coupon_code).addClass('download-failed').find('.sale-price-title').addClass('download-failed');
              is_partial_fail = true;
              totalCouponDownloadButton = res.msg;
              totalCouponDownloadToastMsg = res.entireToastMsg;
            }

            totalCouponWrap.innerHTML = totalCouponDownloadButton;
            detail_downloadable_coupon_count--;
          });

          toastAction(totalCouponDownloadToastMsg);
        }
      });
    }
  };

  // 상세페이지 개별쿠폰 다운로드
  const detailPageDownCoupon = (code) => {
    if (code != '') {
      $.ajax({
        type: 'POST',
        data : {code:code},
        url: ('/shop/detail_page_down_use_coupon.cm'),
        dataType: 'json',
        async: true,
        cache: false,
        success: function(res){
          $detail_coupon_list = $("#modal_coupon_list");
          $detail_coupon_list.find("._coupon_down_wrap_"+code).hide();
          if (res.download === "SUCCESS"){
            $detail_coupon_list.find(".btn_down_complete_wrap_"+code).show();
            $detail_coupon_list.find('.coupon_wrap_'+code).addClass('download-done').find('.sale-price-title').addClass('download-done');
          } else {
            $detail_coupon_list.find(".btn_down_complete_wrap_"+code).hide();
            $detail_coupon_list.find(".btn_down_failed_wrap_"+code).show();
            $detail_coupon_list.find(".coupon_wrap_" + code).addClass('download-failed').find('.sale-price-title').addClass('download-failed');

            toastAction(res.toastMsg);
          }

          detail_downloadable_coupon_count--;
          if (detail_downloadable_coupon_count == 0) {
            const totalCouponWrap = document.querySelector('.total_coupon_wrap');
            totalCouponWrap.innerHTML = res.msg;
          }
        }
      });
    }
  };
  
	//my page 쿠폰 다운받기
	function downCoupon(code){
		$.ajax({
			type: 'POST',
			data : {code:code},
			url: ('/shop/mypage_down_use_coupon.cm'),
			dataType: 'json',
			async: true,
			cache: false,
			success: function(res){
        if(res.msg === "SUCCESS"){
          $couopn_list.find("._coupon_down_wrap_"+code).hide();
          $couopn_list.find(".btn_down_complete_wrap_"+code).show();
          $couopn_list.find('.coupon_wrap_' +code).addClass('download-done').find('.sale-price-title').addClass('download-done');
          $couopn_list.find('.coupon_wrap_' +code).find('.use-info').removeClass('use-info').addClass('use-info-download-done');
          $couopn_list.find('.coupon_wrap_' +code).find('.sale-price-text').removeClass('sale-price-text').addClass('sale-price-text-done');

          $mypage_modal_coupon_list = $(".modal_mypage_coupon_use_list");
          if ($mypage_modal_coupon_list) {
            $mypage_modal_coupon_list.find("._coupon_down_wrap_"+code).hide();
            $mypage_modal_coupon_list.find(".btn_down_complete_wrap_"+code).show();
            $mypage_modal_coupon_list.find('.coupon_wrap_' +code).addClass('download-done').find('.sale-price-title').addClass('download-done');
            $mypage_modal_coupon_list.find('.coupon_wrap_' +code).find('.use-info').removeClass('.use-info').addClass('use-info-download-done');
          }
        }else{
          alert(res.msg);
        }
      }
		});
	}
	//쿠폰적용 다이얼로그 설정
	function setCouponTargetDialog(){
		$couopn_list.find("._coupon_target_btn").off("click.coupon_target_btn").on("click.coupon_target_btn",function(){
			var coupon_code = $(this).data("code");
			if(!isBlank(coupon_code)){
				$.ajax({
					type: 'POST',
					data : {coupon_code:coupon_code},
					url: ('/dialog/mypage_coupon_target.cm'),
					dataType: 'html',
					async: true,
					cache: false,
					success: function(res){
						$.cocoaDialog.open({type : 'mypage_coupon_target', custom_popup : $(res)});
					}
				});
			}
		});
	}
  
	function setCouponUseDialog(){
		$couopn_list.find("._coupon_use_btn").off("click").on("click.coupon_use_btn", function () {
      var coupon_code = $(this).data("code");
      $.ajax({
        type: 'POST',
        url: ('/dialog/mypage_coupon_use_list.cm'),
        data: {code: coupon_code},
        dataType: 'json',
        async: true,
        cache: false,
        success: function(res) {
          if (res.msg === "SUCCESS") {
            $.cocoaDialog.open(
              //모달이 오픈되었을때
              {type: 'mypage_coupon_use_list', custom_popup: $(res.html)},
              function() {
                $case_category_list = $("._case_category_wrap");
                $case_product_list = $("._case_product_wrap");
                getCouponApplyList(true, coupon_code);
                $(".modal_mypage_coupon_use_list").find("._down_coupon_btn").off("click._down_coupon_btn").on("click._down_coupon_btn", function() {
                  var code = $(this).data("code");
                  if (code !== "") {
                    downCoupon(code);
                  }
                });
                couponTitleResponsiveFontSize('.modal_mypage_coupon_use_list');
              });
            // 사용제외 목록 on / off
            /**
             * 모달에 사용제외 목록이 붙어있는데, 얘는 사용제외가 있을 경우에만 생성이 되기때문에 모달 오픈후에 뿌려주도록 스크립트를 넣어줌 ! 
             * 모양이 보기좋지는 않기때문에... 시간이 된다면 수정예정
             * */
            const excluded_list = document.querySelectorAll('.excluded_list_warp');
            if (excluded_list.length !== 0) {
              excluded_list.forEach(list => {
                let ExcludedShowBtn = list.querySelector(
                  '._btn_show_excluded_prod_list');
                let ExcludedHideBtn = list.querySelector(
                  '._btn_hide_excluded_prod_list');
                ExcludedShowBtn.addEventListener('click', (e) => {
                  ExcludedShowBtn.classList.add('hide');
                  ExcludedHideBtn.classList.add('show');
                  list.querySelector('._coupon_excluded_text_wrap').
                    classList.
                    add('show');
                });
                ExcludedHideBtn.addEventListener('click', (e) => {
                  ExcludedHideBtn.classList.add('hide');
                  ExcludedHideBtn.classList.remove('show');
                  ExcludedShowBtn.classList.remove('hide');
                  list.querySelector('._coupon_excluded_text_wrap').
                    classList.remove('show');
                });
              });
            }
          } else {
            alert(res.msg);
          }
        }
      });
    });
	}
  
	function getCouponApplyList(list_clear,code){
		if(list_clear === true) {
			page = 1;
			$case_category_list.empty();
			$case_product_list.empty();
			$(".modal_mypage_coupon_use_list").find(".more").hide();
		}
		$.ajax({
			type: 'POST',
			url: ('/dialog/get_coupon_apply_list.cm'),
			data : {"code" : code, "page" : page},
			dataType: 'json',
			async: true,
			cache: false,
			success: function (res){
				if(res.msg === "SUCCESS"){
					if(res.is_category === "Y"){
						$case_category_list.append(res.html);
					}else{
						$case_product_list.append(res.html);
					}
					page+=1;
					if(res.is_more === "N") $(".modal_mypage_coupon_use_list").find(".more").hide();
					else $(".modal_mypage_coupon_use_list").find(".more").show();
				}else{
					alert(res.msg);
				}
			}
		});
	}
  
  // 마이페이지내에서 쿠폰 폰트 사이즈를 조절해주는 함수
  const couponTitleResponsiveFontSize = (currentElement) => {
    // currentElement = 쿠폰 row들을 담고있는 부모요소의 클래스명 or 아이디명 넣어주면 됌
      const CouponWrap = document.querySelector(currentElement);
      const couponTitleList = CouponWrap.querySelectorAll('.sale-price-title');
      couponTitleList.forEach(title => {
        const couponTitleHeight = title.clientHeight;
        //40은 쿠폰 타이틀 한줄기준 높이
        couponTitleHeight > 40 ? title.style.fontSize = '20px' : title.style.fontSize = '28px';
      });
  };
  
  // 마이페이지내에서 한 row안에서 제일 긴 쿠폰사이즈로 변경시켜주는 함수
  const couponSizeResponsive = () => {
      const windowWidth = window.innerWidth;
      if (windowWidth > 768) {
        const myPageCoupon = document.querySelector('#couopn_list');
        if (!myPageCoupon) return;
          const couponRows = myPageCoupon.querySelectorAll('.row');
          couponRows.forEach(row => {
            let couponHeight = 0;
            const couponWrapList = row.querySelectorAll('.coupon-wrap');
            Array.from(couponWrapList).map(coupon => {
              couponHeight = coupon.getBoundingClientRect().height > couponHeight ? coupon.getBoundingClientRect().height : couponHeight;
            });
            couponWrapList.forEach(coupon => {
              coupon.style.height = `${couponHeight}px`;
            });
          });
        
      }else {
          const couponWrapList = document.querySelectorAll('.coupon-wrap');
          couponWrapList.forEach(coupon => {
            coupon.style.height = 'auto';
          });
        }
  };
  window.addEventListener('resize', couponSizeResponsive);

	return {
		init:function(){
			init();
		},
    initDetail:function(){
      initDetail();
    },
    couponTitleResponsiveFontSize : (currentElement) => {
      couponTitleResponsiveFontSize(currentElement);
    },
    getCouponApplyList: function(list_clear,code){
			getCouponApplyList(list_clear,code);
		},
    detailPageDownCoupon: function(code){
      detailPageDownCoupon(code);
    },
    downloadEntireCoupon: function(code, array) {
      downloadEntireCoupon(code, array);
    },
    openCouponDownloadModal : function(prod_code){
      openCouponDownloadModal(prod_code);
    },
    couponSizeResponsive : function() {
      couponSizeResponsive();
    }
	};
}();