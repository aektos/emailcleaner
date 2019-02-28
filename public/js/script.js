(function (window, document, $, Handlebars) {
    var app = {
        'isAjaxPending': false,
        'ui': function () {
            $('.sidenav').sidenav();
            $(".dropdown-trigger").dropdown();
            $('#loader-modal').modal({dismissible: false});
        },
        'socket': null,
        'ioConnect': function() {
            app.socket = io.connect();
        },
        'dashboard': function () {
            var $el = $('.dashboard');
            if (!$el.length) {
                return;
            }
            var event = window.location.toString().indexOf('gmail') !== -1 ? "gmail-clean" : "outlook-clean";

            $('#loader-modal').modal('open');

            app.socket.on('cleaned', function (data) {
                console.log(data);
                var source   = document.getElementById('clean').innerHTML;
                var template = Handlebars.compile(source);
                var context = {emailIndex: data};
                var html    = template(context);
                $el.append(html);

                $('.modal-emailview').modal();
                $('#dashboard-loader').toggleClass('active');
                $('#loader-modal').modal('close');
            });

            app.socket.on('processing', function() {
                $('#btn-kill').show();
            });

            app.socket.on('error', function (data) {
                $('#dashboard-loader').toggleClass('active');
                $('#loader-modal').modal('close');
                $el.append('<p>Ops, the service is unavailable. Something has gone wrong.</p>');
            });

            app.socket.emit(event);
        },
        'delete': function (id, messages) {
            var that = this;
            var $el = $('.dashboard');
            if (!$el.length) {
                return;
            }
            var event = window.location.toString().indexOf('gmail') !== -1 ? "gmail-delete" : "outlook-delete";

            if (!this.isAjaxPending) {
                this.isAjaxPending = true;
                $('#dashboard-loader').toggleClass('active');
                $('#loader-modal').modal('open');

                app.socket.on('deleted', function(data) {
                    $('#' + data.id).remove();
                    $('#dashboard-loader').toggleClass('active');
                    $('#loader-modal').modal('close');
                    that.isAjaxPending = false;
                });

                app.socket.on('error', function (data) {
                    $('#dashboard-loader').toggleClass('active');
                    $('#loader-modal').modal('close');
                    $el.append('<p>Ops, the service is unavailable. Something has gone wrong.</p>');
                });

                app.socket.emit(event, {
                    'id': id,
                    'messages': messages
                });
            }
        },
        'kill': function () {
            console.log('kill');
            app.socket.emit('kill');

            app.socket.on('killed', function() {
                $('#kill-btn').hide();
                $('#dashboard-loader').toggleClass('active');
                $('#loader-modal').modal('close');
                window.location = "/";
            });
        }
    };

    window.app = app;

    $(document).ready(function () {
        window.app.ui();
        window.app.ioConnect();
        window.app.dashboard();
    });
})(window, document, jQuery, Handlebars);