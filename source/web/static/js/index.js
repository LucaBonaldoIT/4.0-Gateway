`use strict`;

//import "../jquery/js/jquery-3.6.0"

function change_theme() {
    let current_theme = $('meta[name=theme]').attr('content');
    if (current_theme == 'light') {
        $('meta[name=theme]').attr('content', 'dark');
        $('body').removeClass('bg-light').removeClass('text-bg-light');
        $('body').addClass('bg-dark').addClass('text-bg-dark');

    } else {
        $('meta[name=theme]').attr('content', 'light');
        $('body').removeClass('bg-dark').removeClass('text-bg-dark');
        $('body').addClass('bg-light').addClass('text-bg-light');
    }

}