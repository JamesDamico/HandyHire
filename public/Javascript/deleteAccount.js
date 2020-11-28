$(window).on('load', function() {
    var deleteAccountInput = document.getElementById("deleteAccountInput");
    var deleteAccountBtn = document.getElementById("deleteAccountBtn");
    var matchText = document.getElementById("matchText");

    deleteAccountBtn.disabled = true;

    deleteAccountInput.onkeyup = ()=> {
        if(deleteAccountInput.value === matchText.textContent){
            deleteAccountBtn.disabled = false;
        } else {
            deleteAccountBtn.disabled = true;
        }
    }  
});