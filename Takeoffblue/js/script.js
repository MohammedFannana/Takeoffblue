$(document).ready(function () {
  new WOW().init();
  $("#js-rotating").Morphext({
    animation: "bounceIn",
    separator: ",",
    speed: 2000,
    complete: function () {},
  });
  $("#tabs_btn1").css({ background: "white", color: "#0083db" });
  $(".tab2").hide();
  $(".tab3").hide();
  $("#tabs_btn1").click(() => {
    $(".tab1").fadeIn();
    $(".tab2").hide();
    $(".tab3").hide();
    $("#tabs_btn1").css({ background: "white", color: "#0083db" });
    $("#tabs_btn2").css({ background: "transparent", color: "black" });
    $("#tabs_btn3").css({ background: "transparent", color: "black" });
  });
  $("#tabs_btn2").click(() => {
    $(".tab1").hide();
    $(".tab2").fadeIn();
    $(".tab3").hide();
    $("#tabs_btn2").css({ background: "white", color: "#0083db" });
    $("#tabs_btn1").css({ background: "transparent", color: "black" });
    $("#tabs_btn3").css({ background: "transparent", color: "black" });
  });
  $("#tabs_btn3").click(() => {
    $(".tab1").hide();
    $(".tab2").hide();
    $(".tab3").fadeIn();
    $("#tabs_btn3").css({ background: "white", color: "#0083db" });
    $("#tabs_btn1").css({ background: "transparent", color: "black" });
    $("#tabs_btn2").css({ background: "transparent", color: "black" });
  });
  function shortenText(selector, wordCount) {
    const element = document.querySelectorAll(selector);

    element.forEach((element_) => {
      const text = element_.innerText;
      const words = text.split(" ");
      if (words.length > wordCount) {
        element_.innerText = words.slice(0, wordCount).join(" ") + " ...";
      }
    });
  }
  shortenText("#text", 4);

  // card tabs
  var cards = document.querySelectorAll(".pdf_card");
  cards.forEach((el) => {
    $(el).click((e) => {
      e.preventDefault();
      console.log($(el).attr("href"));
      console.log($(el).next().find("form").html());
      var ele = `<div class="_tab_ d-flex justify-content-between align-items-center">
      <p class="m-0"><span>O</span> lllll</p>
      <p class="m-0 exit">x</p>
  </div>`;
      $(".brows_click_tabs").append(ele);
      $(document).on("click", ".exit", () => {
        $(this).parent().hide()
        console.log($(this).parent().html());
      });
    });
  });
  // note area
  $('textarea#tiny').tinymce({
    height: 400,
    menubar: false,
    apikey:'r0keiz3ur6fkipbhf2kiych2v0diq4nicxxuvr4blm9r87e5',
    plugins: [
       'a11ychecker','advlist','advcode','advtable','autolink','checklist','markdown',
       'lists','link','image','charmap','preview','anchor','searchreplace','visualblocks',
       'powerpaste','fullscreen','formatpainter','insertdatetime','media','table','help','wordcount'
    ],
    toolbar: 'undo redo | a11ycheck casechange blocks | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist checklist outdent indent | removeformat | code table help'
  });
  $('.add_note_area').hide()
  $('#add_note').click(()=>{
    $('#add_note').parent().hide()
  $('.add_note_area').fadeIn();

  })
});
