---
layout: portfolio
permalink: projects/sketchbook
title: Sketchbook
page: projects
description:
date: 1-1-2018
color: '#BFE3F2'
image: /images/projects/doodle-or-die/screen-game.jpg
shortHeader: true
---
{% assign pageColor =  'BFE3F2' %}

<div class="pb5 f4 lh-copy">

<p class="mw8-l pt5 pb4">
    Drawing is the one thing I've always known I could do. While I've never been able to find a career in it, I return to it when I can. Most of these were completed around 2017 and 2018, all using Procreate on the iPad Pro.
</p>

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