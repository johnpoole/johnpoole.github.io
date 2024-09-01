(function (window, document) {
    var layout = document.getElementById('layout'),
        menu = document.getElementById('menu'),
        menuLink = document.getElementById('menuLink'),
        content = document.getElementById('main');

    function toggleClass(element, className) {
        var classes = element.className.split(/\s+/),
            index = classes.indexOf(className);

        if (index >= 0) {
            classes.splice(index, 1); // Remove the class if it exists
        } else {
            classes.push(className); // Add the class if it doesn't exist
        }

        element.className = classes.join(' ');
    }

    function toggleAll(e) {
        e.preventDefault();
        var active = 'active';
        
        toggleClass(layout, active);
        toggleClass(menu, active);
        toggleClass(menuLink, active);
    }

    menuLink.addEventListener('click', toggleAll);

    content.addEventListener('click', function(e) {
        if (menu.classList.contains('active')) {
            toggleAll(e);
        }
    });

}(this, this.document));
