window.addEventListener("load", () => {
  const loader = document.querySelector(".preloader");

  loader.classList.add("preloader-hidden");

  loader.addEventListener("transitionend", () => {
    document.body.removeChild(loader);
  });
});



import { PageFlip } from "https://cdn.skypack.dev/page-flip@2.0.7";

const pageFlip = new PageFlip(document.getElementById("holidayList"), {
	width: 1130, // base page width
	height: 1598, // base page height
  
	size: "stretch",
	// set threshold values:
	maxShadowOpacity: 0.5,
	showCover: true,
	mobileScrollSupport: true,
  startPage: 27,
  usePortrait:true,
  drawShadow: true,
});

pageFlip.loadFromHTML(document.querySelectorAll(".holiday-item"));


var
  words = [
  'أهلاً وسهلاً بكم',
  'نضع بين أيديكم',
  'كتيب حفل معايدة «عيد الفطر» 1446هـ',
  'فرع وزارة الموارد البشرية والتنمية الاجتماعية بالمنطقة الشرقية',
  'نتمنى لكم مُشاهدة مُمتعة',

],
  part,
  i = 0,
  offset = 0,
  len = words.length,
  forwards = true,
  skip_count = 0,
  skip_delay = 10,
  speed = 100;

var wordflick = function(){
  setInterval(function(){
      if (forwards) {
        if(offset >= words[i].length){
          ++skip_count;
          if (skip_count == skip_delay) {
            forwards = false;
            skip_count = 0;
          }
        }
      }
      else {
         if(offset == 0){
            forwards = true;
            i++;
            offset = 0;
            if(i >= len){
              i=0;
            } 
         }
      }
      part = words[i].substr(0, offset);
      if (skip_count == 0) {
        if (forwards) {
          offset++;
        }
        else {
          offset--;
        }
      }
    	$('.word').text(part);
  },speed);
};

$(document).ready(function(){
  wordflick();
});
