#!/bin/bash

# SKETCHBOOK_ENTRIES=`ls -laR "images/sketchbook" | egrep '\.jpg$|\.JPG$' | awk '{print $9}'`
# PHOTO_ENTRIES=`ls -laR "images/sketchbook" | egrep '\.jpg$|\.JPG$' | awk '{print $9}'`

SKETCHBOOK_DIRS=`ls -dl images/sketchbook/* | awk '{print $9}'`
rm _sketchbook/pages/*.md

for SK_DIR in $SKETCHBOOK_DIRS 
do
# Make subfolder in posts area
DIR="${SK_DIR//images\/sketchbook\//}"

SKETCHBOOK_ENTRIES=`ls -laR ${SK_DIR} | egrep '\.jpg$|\.JPG$' | awk '{print $9}'`
    for SKETCH in $SKETCHBOOK_ENTRIES 
    do
        if [[ $SKETCH != *"thumb.jpg"* ]]; then
            SKETCH_METADATA=(${SKETCH//./ })
            SKETCH_FILENAME="_sketchbook/pages/${DIR}-${SKETCH_METADATA[0]}.md"
            > SKETCH_FILENAME
##### START FILENAME
echo "---
layout: portfolio
permalink: sketchbook/${DIR}/${SKETCH_METADATA[0]}
title: Sketchbook
category: ${DIR}
page: sketchbook
color: yellow
date: 1-1-${SKETCH_METADATA[1]}
image: /images/sketchbook/${DIR}/${SKETCH}
thumbnail: /images/sketchbook/${DIR}/${SKETCH//.jpg/.thumb.jpg}
imageTitle: ${SKETCH_METADATA[0]//-/ }
imageMeta: Made with iPad Pro + Procreate
---" >> ${SKETCH_FILENAME}
##### END FILENAME
        fi
    done
done


