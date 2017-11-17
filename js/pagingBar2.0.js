/**
 * pagingBar 2.0
 * Copyright  (c) zhangry3 
 * 2.0 	1.添加了一个新的分页样式
 * 		2.解决了一个页面中添加多个分页插件的时候，分页数据混乱的问题
 * 		3.保留了一些字段currentPgt，tolPgt，isflag 暂未被使用
 * 
 * 2.1  1.修改样式二当前页居中的位置在345的时候位移不正常的问题
 * 2016/3/24发现问题1.样式2 在页数过多时候会导致页面出现卡顿的情况
 * 				 2.样式2 在页数大后会切换有问题
 * 
 * 使用方法
  			<div id="pb2" style="width: 550px;" align="left">
  			<script type="text/javascript">
  				//必须  
 				$("#pb2").PagingBar({
 					pagingBarType:2  //初始化，不填写即默认
 				});
 
 				//非必须 第一次触发获取数据，设置参数。也可主动触发并使用pgchange方法进行操作
 				$("#pb2").PagingBar.init({
 
 				},"pb2");
 				
 				//
 				$("#pb2").PagingBar.pgchange({
 					countNum:60		//获取到总页数之后修改中参数即可，countNum唯一必须获取的数据
 				},"pb2");
 				
 				//外部必须实现
 				function getDataPG(currentPage,pageSize,fid){
 					//此处为 点击分页触发的方法，currentPage：当前页 pageSize：每页的数据量
 				}
 				
 				//获取分页参数
 				var optsTaskPB = $("#pb2").PagingBar.opts["pb2"];
 			</script>
 			
 			
 * Date : 2015-08-24
 */
(function($) {
	var defaults = {
			 isflag:false
			,countNum:0		//数据总数
			,pageSize:5		//一页显示多少数据
			,currentPage:1	//当前页
			,tolPage:0		//总页数
			,pagingBarType:1//分页栏样式
			,currentPgt:1	// 分页栏样式2 有效  当前分页栏数
			,tolPgt:0		// 分页栏样式2 有效 总分页栏数
			,animateFlag:false
			,pageSizeShow:true 
			 
	};
	var opts = {};
	var SP = $.fn.PagingBar = function(options) {
		var fid = $(this).attr("id");
		opts[fid] = $.extend({}, defaults , options||{});
		return this.each(function(){
			var type=opts[fid].pagingBarType;
			$("#"+fid).empty();
			if(type == 1){
				$("#"+fid).addClass("pg_pagingBar1");
				$("#"+fid).append('<div class="pgsize">每页显示 <input id="bpPagesize" class="pbInput" type="text" > 条数据</div> <div class="spile"></div>'
						+'<div id="firstB" class="bpButton"  ></div>'
						+'<div id="preB" class="bpButton"  ></div>'
						+'<div class="spile"></div>'
						+'<p class="bpP">第</p><input id="currentP" class="pbInput" type="text"><p class="bpP">页 共<span id="tolPages"></span>页</p>'
						+'<div class="spile"></div>'
						+'<div id="nextB" class="bpButton"   ></div>'
						+'<div id="endB" class="bpButton"  ></div>'
						+'<div class="spile"></div>'
						+'<div id="refushB" class="bpButton"  ></div>'
						+'<p class="bpP" style="margin-left:10px;">当前显示<span id="currentN"></span>条数据  共<span id="tolN"></span>条数据</p>');
				 
				$("#"+fid+" #firstB").click(function (){firstPage(fid);});
				$("#"+fid+" #preB").click(function (){prePage(fid);});
				$("#"+fid+" #endB").click(function (){endPage(fid);});
				$("#"+fid+" #nextB").click(function (){nextPage(fid);});
				$("#"+fid+" #refushB").click(function (){refushPage(fid);});
				$("#"+fid+' #currentP').keydown(function(e){
					if(e.keyCode==13){
						if( $("#"+fid+' #currentP').val() >0 )
							opts[fid].currentPage=$("#"+fid+' #currentP').val();
						pageChange(fid);
					}
					});
				$("#"+fid+' #bpPagesize').keydown(function(e){
					if(e.keyCode==13){
						if( $("#"+fid+' #bpPagesize').val() > 0)
							opts[fid].pageSize =  $("#"+fid+' #bpPagesize').val() ;
						pageChange(fid);
						
					}
					}); 
			}else if(type == 2){
				//初始化样式
				$("#"+fid).addClass("pg_pagingBar2");
				$("#"+fid).append('	<div class="pgsize" style="float:left">每页显示 <input id="bpPagesize" class="pbInput" type="text" value="'+opts[fid].pageSize+'" > 条数据</div> <div style="float:left;height: 30px;" class="spile"></div><div class="pg_firstB2"></div>'+
						'<div class="pg_numberDiv2">'+
							'<ul>'+
								'<li>1</li>'+
								'<li>2</li>'+
								'<li>3</li>'+
								'<li>4</li>'+
								'<li>5</li>'+
							'</ul>'+
						'</div>'+
						'<div class="pg_endB2"> </div>');
				$("#"+fid + " .pg_firstB2").click( function (){
					prePgt(fid);
				});
				$("#"+fid + " .pg_endB2").click( function (){
					nextPgt(fid);
				});
				$("#"+fid+' #bpPagesize').keydown(function(e){
					if(e.keyCode==13){
						if( $("#"+fid+' #bpPagesize').val() > 0)
							opts[fid].pageSize =  $("#"+fid+' #bpPagesize').val() ;
						pageChange(fid);
						
					}
					}); 
				
				if(!opts[fid].pageSizeShow){
					$("#"+fid +" .pgsize,"+"#"+fid +" .spile").hide();
				}
			}
			
		});
	};
	
	function pagingBarType2Establish(fid){
		var countNum = opts[fid].countNum;
		var pageSize = opts[fid].pageSize;
		var tolPage = 0;
		if(countNum%pageSize >0){
			tolPage = (countNum-countNum%pageSize)/pageSize+1;
		}else{
			tolPage = countNum/pageSize;
		}
		//如果总页数不变动，则不重新构建
		if(tolPage != opts[fid].tolPage){
			//若种
			opts[fid].tolPage = tolPage;
			$("#"+fid +" .pg_numberDiv2 ul").empty(); 
			var liStr = "";
			if(opts[fid].tolPage >= 5){
				for(var i = 0 ; i < opts[fid].tolPage ; i++){
					liStr += '<li>'+(i+1)+'</li>';
				}
			}else{
				for(var i = 0; i< 5;i++){
					if((i+1) <= opts[fid].tolPage){
						liStr +=  '<li>'+(i+1)+'</li>';
					}else{
						liStr +=  '<li class="diable">'+(i+1)+'</li>';
					}
				}
			}
			$("#"+fid +" .pg_numberDiv2 ul").append(liStr);
			
			$("#"+fid +" .pg_numberDiv2 ul li").click(function (){
				var clickItem =  $(this).html(); 
				if(clickItem <= opts[fid].tolPage){
					opts[fid].currentPage = clickItem;
					pageChange(fid);
				}
			});
		}
		//
		numberChange(fid);
	}
	
	//参数对外开放
	SP.opts= opts;
	
	SP.init = function init(options,fid){
		opts[fid] =  jQuery.extend({}, opts[fid] , options||{});
		if(opts[fid].countNum >= 0 && opts[fid].pageSize>=0){
			getDataPG(opts[fid].currentPage,opts[fid].pageSize);
		}
	};
	
	SP.pgchange = function change(options,fid){
		opts[fid] = $.extend({}, opts[fid] , options||{});
		var type = opts[fid].pagingBarType;
		if(type == 1){
			if(opts[fid].countNum >= 0 && opts[fid].pageSize > 0){
				numberChange(fid);
			}
		} else if(type == 2){
			pagingBarType2Establish(fid);
		}
	};
	
	function firstPage(fid){
		opts[fid].currentPage = 1;
		pageChange(fid);
	}
	function endPage(fid){
		opts[fid].currentPage = opts[fid].tolPage;
		pageChange(fid);
	}

	function prePage(fid){
		if(opts[fid].currentPage>1){
			opts[fid].currentPage -=1;
		}else{
			opts[fid].currentPage=1;
		}
		pageChange(fid);
	}

	function nextPage(fid){
		if(opts[fid].currentPage<opts[fid].tolPage){
			opts[fid].currentPage +=1;
		}else{
			opts[fid].currentPage=opts[fid].tolPage;
		}
		pageChange(fid);
	}

	function refushPage(fid){
		pageChange(fid);
	}
	
	//下一页标签 
	function nextPgt(fid){
		if(opts[fid].tolPage <=5){
			return ;
		}
		if(!opts[fid].animateFlag){
			opts[fid].animateFlag = true;
			var ulLft = parseInt($("#"+fid +" .pg_numberDiv2 ul").css("left"));
			if(ulLft <= -(opts[fid].tolPage*33 -165*2)){
				$("#"+fid +" .pg_numberDiv2 ul").animate({"left":-(opts[fid].tolPage*33 -165)},300,function (){
					opts[fid].animateFlag = false;
				});
			}else{
				$("#"+fid +" .pg_numberDiv2 ul").animate({"left":"-=165"},300,function (){
					opts[fid].animateFlag = false;
				});
			}
				
		}
	}
	//上一个标签
	function prePgt(fid){
		if(!opts[fid].animateFlag){
			opts[fid].animateFlag = true;
			var ulLft = parseInt($("#"+fid +" .pg_numberDiv2 ul").css("left"));
			if(isNaN(ulLft) || ulLft >= -165){
				$("#"+fid +" .pg_numberDiv2 ul").animate({"left":"0"},300,function (){
					opts[fid].animateFlag = false;
				});
			}else{
				$("#"+fid +" .pg_numberDiv2 ul").animate({"left":"+=165"},300,function (){
					opts[fid].animateFlag = false;
				});
			}
		}
	}
	//样式二 定位
	function setPgt(fid){
		var tolPage = opts[fid].tolPage;
		var currentPage = opts[fid].currentPage;
		var ulLft = parseInt($("#"+fid +" .pg_numberDiv2 ul").css("left"));
		var curLeft = 0;
		if(currentPage <=4){
			curLeft =0;
		}else if( currentPage >4 && currentPage<= tolPage-3){
			curLeft = -32*(currentPage-3);
		}else if( currentPage > tolPage-3 && currentPage <=tolPage){
			curLeft =-(opts[fid].tolPage*33 -165)
		}
		$("#"+fid +" .pg_numberDiv2 ul").animate({"left":curLeft},300,function (){
			 
		});
	}
	
	function pageChange(fid){
		numberChange(fid);
		//getDataPG 点击想查询相应页面数据，由页面端实现
		if(typeof(getDataPG)!="undefined" && getDataPG&&typeof(getDataPG)=="function")
			getDataPG(opts[fid].currentPage,opts[fid].pageSize,fid);
		
	}
	
	function numberChange(fid){
		var type = opts[fid].pagingBarType;
		var countNum = opts[fid].countNum;
		var pageSize = opts[fid].pageSize;
		opts[fid].tolPage = 0;
		if(countNum%pageSize >0){
			opts[fid].tolPage = (countNum-countNum%pageSize)/pageSize+1;
		}else{
			opts[fid].tolPage = countNum/pageSize;
		}
		if(opts[fid].currentPage>opts[fid].tolPage){
			opts[fid].currentPage = opts[fid].tolPage;
		}
		
		if(type == 1){
			
			$("#"+fid+" #bpPagesize").val(opts[fid].pageSize);
			$("#"+fid+" #tolPages").html(opts[fid].tolPage);
			$("#"+fid+" #currentP").val(opts[fid].currentPage);

			var c1,c2 = "";
			if(opts[fid].pageSize*opts[fid].currentPage>opts[fid].countNum){
				c2 = opts[fid].countNum;
			}else{
				c2 = opts[fid].pageSize*opts[fid].currentPage;
			}
			if(opts[fid].currentPage ==0 ){
				c1 = 0;
			}else{
				c1 =(opts[fid].pageSize*(opts[fid].currentPage-1)+1);
			}
			$("#"+fid+" #currentN").html(c1+"-"+c2);
			$("#"+fid+" #tolN").html(opts[fid].countNum);
			
		}else if(type == 2){
			//当前页添加样式
			$("#"+fid +" .pg_numberDiv2 ul li").removeClass("onClick");
			$($("#"+fid +" .pg_numberDiv2 ul li")[opts[fid].currentPage-1]).addClass("onClick");
			$("#"+fid+" #bpPagesize").val(opts[fid].pageSize);
			setPgt(fid);
		}
		//页面样式计算完毕后，当前页为0的时候，初始化到1的状态
		if(opts[fid].currentPage == 0){
			opts[fid].currentPage =1;
		}
		

		
		SP.opts=  opts;
		
	}
})(jQuery);


