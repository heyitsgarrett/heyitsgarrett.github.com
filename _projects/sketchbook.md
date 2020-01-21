---
layout: portfolio
permalink: projects/sketchbook
title: Sketchbook
page: projects
description:
date: 1-1-2019
color: '#BFE3F2'
image: /images/projects/doodle-or-die/screen-game.jpg
shortHeader: true
galleryCode: |
    <script type="text/javascript">
    var galleries = document.querySelectorAll('.js-grid-gallery');
    var macyInstances = [];
    var macyOptions = {
        trueOrder: true,
        waitForImages: false,
        debug: false,
        margin: 16,
        mobileFirst: true,
        columns: 1,
        breakAt: {
        480: 2,
        960: {
            margin: 32,
            columns: 2
        },
        1120: {
            margin: 32,
            columns: 3
        },
        1920: {
            columns: 4
        }
        }
    };

    for (var i = 0; i < galleries.length; i++) {
        var newId = 'galleryinstance-' + i;
        galleries[i].id = newId;
        macyOptions.container = '#' + newId;
        macyInstances.push(Macy(macyOptions));
    }
    </script>
---
{% assign pageColor =  'BFE3F2' %}

<div class="pb5 f4 lh-copy">
 {% assign tags =  site.sketchbook | map: 'category' | join: ','  | split: ',' | sort %}
    {% assign previousTag = "" %}
    {% for currentTag in tags %}

        {% if previousTag == "" %}
            {% assign previousTag = currentTag %}
        {% endif %}

        {% if currentTag != previousTag %}
            <section class="cf mb2 mb6-ns bt bw1 b--{{pageColor}}">
                <h3 class="f3 tracked w-100 w-25-l fn fl-l ma0 mt2 ttu">{{ previousTag }}</h3>
                <div class="w-100 w-75-l fn fl-l mt3 js-grid-gallery">
                    {% for piece in site.sketchbook  %}
                        {% if piece.category == previousTag and piece.image %}
                            <a href="/{{piece.permalink}}.html" class="db child-element w-25" title="{{piece.title}}">
                                <img
                                    src="{{piece.thumbnail}}"
                                    class="w-100 br3 grow"
                                />
                            </a>
                        {% endif %}
                    {% endfor %}
                </div>
            </section>
            {% assign first_in_loop = true %}
        {% endif %}

        {% if forloop.last %}
            <section class="cf mb3 mb6-ns bt bw2 b--{{pageColor}}">
                <h3 class="f3 tracked w-100 w-25-l fn fl-l ma0 mt2 ttu">{{ previousTag }}</h3>
                <div class="w-100 w-75-l fn fl-l mt3 js-grid-gallery">
                    {% for piece in site.sketchbook  %}
                        {% if piece.category == previousTag and piece.image %}
                            <a href="/{{piece.permalink}}.html" class="db child-element w-25" title="{{piece.title}}">
                                <img
                                    src="{{piece.thumbnail}}"
                                    class="w-100 br3 grow"
                                />
                            </a>
                        {% endif %}
                    {% endfor %}
                </div>
            </section>
        {% endif %}

        {% assign previousTag = currentTag %}

    {% endfor %}
</div>