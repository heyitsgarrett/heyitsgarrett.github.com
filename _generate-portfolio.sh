#!/bin/bash

# SKETCHBOOK_ENTRIES=`ls -laR "images/sketchbook" | egrep '\.jpg$|\.JPG$' | awk '{print $9}'`
# PHOTO_ENTRIES=`ls -laR "images/sketchbook" | egrep '\.jpg$|\.JPG$' | awk '{print $9}'`

SKETCHBOOK_DIRS=`ls -dl images/sketchbook/* | awk '{print $9}'`
rm _sketchbook/pages/*.md

for SK_DIR in $SKETCHBOOK_DIRS 
do
# Make subfolder in posts area
DIR="${SK_DIR//images\/sketchbook\//}"
mkdir "_sketchbook/${DIR}"


SKETCHBOOK_ENTRIES=`ls -laR ${SK_DIR} | egrep '\.jpg$|\.JPG$' | awk '{print $9}'`
POST="---
\nlayout: portfolio
\npermalink: sketchbook/${DIR}
\ntitle: ${DIR}
\ndate: 1-1-2017
\ncategory: ${DIR}
\n---"
# \n<div class='w-100 flex flex-wrap justify-baseline'>
# \n"

    # for SKETCH in $SKETCHBOOK_ENTRIES
    # do
    # # DOIN' IT
    # SKETCH_METADATA=(${SKETCH//./ })
    # SKETCH_FILENAME="_sketchbook/pages/${SKETCH_METADATA[2]}-${SKETCH_METADATA[1]}.md"
    # > ${SKETCH_FILENAME} 
    # # Build file contents
    # echo "---
    # layout: portfolio
    # permalink: sketchbook/pages/${SKETCH_METADATA[1]}
    # title: ${SKETCH_METADATA[1]//-/ }
    # category: ${SKETCH_METADATA[0]}
    # date: 1-1-${SKETCH_METADATA[2]}
    # image: /images/sketchbook/${SKETCH}
    # ---" >> ${SKETCH_FILENAME}
    # # DONE SKETCHES
    # done

    for SKETCH in $SKETCHBOOK_ENTRIES 
    do
        SKETCH_METADATA=(${SKETCH//./ })
        SKETCH_FILENAME="_sketchbook/pages/${DIR}-${SKETCH_METADATA[0]}.md"
        > SKETCH_FILENAME
echo "---
layout: portfolio
permalink: sketchbook/${SKETCH_METADATA[0]}
title: Sketchbook
category: ${DIR}
page: sketchbook
color: yellow
date: 1-1-${SKETCH_METADATA[1]}
image: /images/sketchbook/${DIR}/${SKETCH}
imageTitle: ${SKETCH_METADATA[0]//-/ }
imageMeta: Made with iPad Pro + Procreate
---" >> ${SKETCH_FILENAME}

#         # echo "${SK_DIR}/${SKETCH}"
#         SKETCH_METADATA=(${SKETCH//./ })
#         POST_IMAGE="\n
# \n      <a href='/images/sketchbook/${DIR}/${SKETCH}' class='db portfolio-item' title='${SKETCH_METADATA[0]//-/ }'>
# \n          <div class='aspect-ratio aspect-ratio--1x1'>
# \n              <img 
# \n                  style='background-image:url(/images/sketchbook/${DIR}/${SKETCH});'
# \n                  class='db bg-center cover aspect-ratio--object' 
# \n              />
# \n          </div>
# \n      </a>"
#         POST=$POST$POST_IMAGE
    done
END_POST='\n</div>'
FINAL_POST=$POST
FINAL_FILENAME="_sketchbook/${DIR}/index.md"

echo $FINAL_POST > ${FINAL_FILENAME}
echo $FINAL_POST

done

# rm _sketchbook/*.md # Clear Sketchbook entries

# and now loop through the directories:
# for SKETCH in $SKETCHBOOK_ENTRIES
# do
# # DOIN' IT
# SKETCH_METADATA=(${SKETCH//./ })
# SKETCH_FILENAME="_sketchbook/pages/${SKETCH_METADATA[2]}-${SKETCH_METADATA[1]}.md"
# > ${SKETCH_FILENAME} 
# # Build file contents
# echo "---
# layout: portfolio
# permalink: sketchbook/pages/${SKETCH_METADATA[1]}
# title: ${SKETCH_METADATA[1]//-/ }
# category: ${SKETCH_METADATA[0]}
# date: 1-1-${SKETCH_METADATA[2]}
# image: /images/sketchbook/${SKETCH}
# ---" >> ${SKETCH_FILENAME}
# # DONE SKETCHES
# done
