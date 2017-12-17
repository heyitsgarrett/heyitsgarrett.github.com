#!/bin/bash

SKETCHBOOK_ENTRIES=`ls -laR "images/sketchbook" | egrep '\.jpg$|\.JPG$' | awk '{print $9}'`

# "ls -l $MYDIR"      = get a directory listing
# "| egrep '^d'"      = pipe to egrep and select only the directories
# "awk '{print $8}'"  = pipe the result from egrep to awk and print only the 8th field

# and now loop through the directories:
for SKETCH in $SKETCHBOOK_ENTRIES
do
    # mkdir 
    # echo  "${SKETCH}"
    # ---
    # 0 Places
    # 1 Daily-Routine
    # 2 2017
    # 3 jpg
    # ---
    SKETCH_METADATA=(${SKETCH//./ })
    # echo "---"
    # echo "layout: default"
    # echo "permalink: sketchbook/${SKETCH_METADATA[1]}"
    # echo "title: ${SKETCH_METADATA[1]//-/ }"
    # echo "category: ${SKETCH_METADATA[0]}"
    # echo "date: 1-1-${SKETCH_METADATA[2]}"
    # echo "filename: ${SKETCH}"
    # echo "---"
    echo '---
    layout: default
    permalink: sketchbook/${SKETCH_METADATA[1]}
    title: ${SKETCH_METADATA[1]//-/ }
    category: ${SKETCH_METADATA[0]}
    date: 1-1-${SKETCH_METADATA[2]}
    filename: ${SKETCH}
    ---' >> _sketchbook/${SKETCH}.md
done
