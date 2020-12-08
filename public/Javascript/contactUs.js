$("#contactButton").on("click", function(){
    let yourMessage = document.getElementById("message").value;
    let subject = document.getElementById("subject").value;
    document.location.href = "mailto:handyhirehelp@gmail.com?" + 
    "&subject=" + encodeURIComponent(subject)
        + "&body=" + encodeURIComponent(yourMessage);
});
