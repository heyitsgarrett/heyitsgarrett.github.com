var TxtType = function(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
        this.firstEver = false;
    };

    TxtType.prototype.tick = function() {
        var i = this.loopNum % this.toRotate.length;
        var fullTxt = this.toRotate[i];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }
        if(i > 0) {
            this.firstEver = true;
        }

        if (this.firstEver && (this.txt === 'Sc' || this.txt === 'S' || this.txt === '')) {
            this.el.innerHTML = '<span class="wrap">Scr</span>';
        } else if(this.isDeleting && (this.txt === 'Sc' || this.txt === 'S' || this.txt === '')) {
            this.el.innerHTML = '<span class="wrap">Scr</span>';
            // debugger;
        } else {
            this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';
        }

        var that = this;
        var delta = 200 - Math.random() * 100;

        if (this.isDeleting) { delta /= 2; }

        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }

        if(i === 1 && this.txt === 'Scripto') {
            delta = 3000;
        }

        var cursor = document.querySelector(".wrap");
        if(delta >= 500) {
            cursor.classList.add('blink');
            // make cursor blink
        } else {
            cursor.classList.remove('blink');
        }

        console.log('delta', delta);
        console.log('iterator', i);
        console.log('text', this.txt + '\n***');

        setTimeout(function() {
            that.tick();
        }, delta);
    };

    window.onload = function() {
        var elements = document.getElementsByClassName('typewrite');
        for (var i=0; i<elements.length; i++) {
            var toRotate = elements[i].getAttribute('data-type');
            var period = elements[i].getAttribute('data-period');
            if (toRotate) {
              new TxtType(elements[i], JSON.parse(toRotate), period);
            }
        }
        // INJECT CSS
        var css = document.createElement("style");
        css.type = "text/css";
        document.body.appendChild(css);
    };