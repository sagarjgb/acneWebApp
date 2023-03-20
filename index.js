$(function () {
  var access_token = "TlIIZpPYOxrQM6CDTjLD";
  var model = "acne-vulgaris";
  var format = "image";
  setupButtonListeners();
});

var infer = function () {
  $("#output").html("Processing...");
  $("#resultContainer").show();
  $("html").scrollTop(100000);

  getSettingsFromForm(function (settings) {
    $.ajax(settings).then(function (response) {
      if (settings.format == "json") {
        var pretty = $("<pre>");
        var formatted = JSON.stringify(response, null, 4);

        pretty.html(formatted);
        $("#output").html("").append(pretty);
        $("html").scrollTop(100000);
      } else {
        var arrayBufferView = new Uint8Array(response);
        var blob = new Blob([arrayBufferView], {
          type: "image/jpeg",
        });
        var base64image = window.URL.createObjectURL(blob);

        var img = $("<img/>");
        img.get(0).onload = function () {
          $("html").scrollTop(100000);
        };
        img.attr("src", base64image);
        $("#output").html("").append(img);
      }
    });
  });
};

var setupButtonListeners = function () {
  // run inference when the form is submitted
  $("#inputForm").submit(function () {
    infer();
    return false;
  });

  // make the buttons blue when clicked
  // and show the proper "Select file" or "Enter url" state
  $(".bttn").click(function () {
    $(this).parent().find(".bttn").removeClass("active");
    $(this).addClass("active");

    if ($("#urlButton").hasClass("active")) {
      $("#urlContainer").show();
      $("#fileSelectionContainer").hide();
    } else {
      $("#urlContainer").hide();
      $("#fileSelectionContainer").show();
    }

    return false;
  });

  // wire styled button to hidden file input
  $("#fileMock").click(function () {
    $("#file").click();
  });

  // grab the filename when a file is selected
  $("#file").change(function () {
    var path = $(this).val().replace(/\\/g, "/");
    var parts = path.split("/");
    var filename = parts.pop();
    $("#fileName").val(filename);
  });
};

var getSettingsFromForm = function (cb) {
  var settings = {
    method: "POST",
  };

  var parts = [
    "https://detect.roboflow.com/acne-vulgaris/1?api_key=TlIIZpPYOxrQM6CDTjLD&confidence=40&overlap=30&format=image&labels=off&stroke=2&ipo=images&image=",
  ];

  //   confidence
  var confidence = 10 / 100;
  if (confidence) parts.push("&confidence=" + confidence);

  //   overlap
  var overlap = 45 / 100;
  if (overlap) parts.push("&overlap=" + overlap);

  //   Format "image" or "json"
  var format = "image";
  parts.push("&format=" + format);
  settings.format = format;

  if (format == "image") {
    if (true) parts.push("&labels=off");

    var stroke = 1;
    if (stroke) parts.push("&stroke=" + stroke);

    settings.xhr = function () {
      var override = new XMLHttpRequest();
      override.responseType = "arraybuffer";
      return override;
    };
  }

  // Upload via File or URL
  var method = $("#method .active").attr("data-value");
  if (method == "upload") {
    var file = $("#file").get(0).files && $("#file").get(0).files.item(0);
    if (!file) return alert("Please select a file.");

    getBase64fromFile(file).then(function (base64image) {
      settings.url = parts.join("");
      settings.data = base64image;

      console.log(settings);
      cb(settings);
    });
  } else {
    var url = $("#url").val();
    if (!url) return alert("Please enter an image URL");

    parts.push("&image=" + encodeURIComponent(url));

    settings.url = parts.join("");
    console.log(settings);
    cb(settings);
  }
};

var getBase64fromFile = function (file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.onerror = function (error) {
      reject(error);
    };
  });
};
// end of File or URL upload
