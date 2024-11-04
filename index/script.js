function toggleSection(sectionId) {
    var sections = ['aboutSectionA', 'aboutSectionB', 'demo'];

    sections.forEach(function(sec) {
        var section = document.getElementById(sec);
        if (sec === sectionId) {
            if (section.style.display === 'none') {
                section.style.display = 'block';
            } 
        } else {
            section.style.display = 'none';
        }
    });
}