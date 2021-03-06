(function (window, document, $, Handlebars) {
    var app = {
        'isDeleteting': false,
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

            $('#dashboard-loader').toggleClass('active');
            $('#loader-modal').modal('open');

            app.socket.on('deleted', function(data) {
                $('#' + data.id).remove();
                $('#dashboard-loader').toggleClass('active');
                $('#loader-modal').modal('close');
                that.isDeleting = false;
            });

            app.socket.on('error', function (data) {
                $('#dashboard-loader').toggleClass('active');
                $('#loader-modal').modal('close');
                $el.append('<p>Ops, the service is unavailable. Something has gone wrong.</p>');
                that.isDeleting = false;
            });

            if (!this.isDeleting) {
                this.isDeleting = true;
                app.socket.emit(event, {
                    'id': id,
                    'messages': messages
                });
            }
        }
    };

    window.app = app;

    $(document).ready(function () {
        window.app.ui();
        window.app.ioConnect();
        window.app.dashboard();
    });
})(window, document, jQuery, Handlebars);