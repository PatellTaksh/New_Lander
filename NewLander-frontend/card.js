function openDetails() {
    document.getElementById("detailsModal").style.display = "flex";
}

function closeDetails() {
    document.getElementById("detailsModal").style.display = "none";
}

// Close modal on outside click
window.addEventListener("click", function (e) {
    const modal = document.getElementById("detailsModal");
    if (e.target === modal) {
        modal.style.display = "none";
    }
});
