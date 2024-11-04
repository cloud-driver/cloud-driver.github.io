function checkDecodedMessage() {
    let decodedMessage = document.getElementById("decodedMessage").value.trim();
    let feedback = document.getElementById("feedback"); // Element to display feedback messages

    // Assuming the decoded and ROT13-transformed message should be "aisthreeclub"
    if (decodedMessage.toLowerCase() === "aisthreeclub") {
        feedback.textContent = "已解密成功！準備前往大結局。";
        feedback.style.color = "green";
        document.getElementById("nextLevel").style.display = "block";
    } else {
        feedback.textContent = "解密失敗，請再試一次。";
        feedback.style.color = "red";
    }
}
