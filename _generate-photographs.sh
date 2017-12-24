##### START PHOTOGRAPHy

PHOTOGRAPH_DIRS=`ls -dl images/photography/* | awk '{print $9 " " $10}'`

# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# WARNING: Remove any legacy pages
rm _photography/pages/*.md
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


for PH_DIR in $PHOTOGRAPH_DIRS; do
    PHOTO_ENTRIES=`ls -laR ${PH_DIR} | egrep '\.jpg$|\.JPG$' | awk '{print $9}'`
    SRC_DIR="${PH_DIR//images\/photography\//}"
    DIR="${SRC_DIR}"

    if echo "${SRC_DIR}" | grep '[0-9]'; then
        DIR="${SRC_DIR//[[:digit:]]/}" # Remove digits from the photo title
        DIR="${DIR//-/ }" # Replace dashes with space
        DIR="${DIR#?}" # Remove first character (an empty space)
    fi
    
    
    for PHOTO in $PHOTO_ENTRIES; do
        if [[ $PHOTO != *"thumb.jpg"* ]]; then
            PHOTO_METADATA=(${PHOTO//./ })
            PHOTO_ORDER="99"
            PHOTO_NAME="${PHOTO_METADATA[0]}"

            if echo "${PHOTO_NAME}" | grep '[0-9]'; then
                PHOTO_ORDER="${PHOTO_NAME:0:2}"
                PHOTO_NAME="${PHOTO_NAME//[[:digit:]]/}" # Remove digits from the photo title
                PHOTO_NAME="${PHOTO_NAME//-/ }" # Replace dashes with space
                PHOTO_NAME="${PHOTO_NAME#?}" # Remove first character (an empty space)
            fi
            
            PHOTO_FILENAME="_photography/pages/${DIR}-${PHOTO_NAME// /-}.md"
            > PHOTO_FILENAME

##### START FILENAME
echo "---
layout: portfolio
permalink: photography/${DIR}/${PHOTO_NAME// /-}
title: Photography
category: ${DIR}
page: photography
color: light-green
date: 1-1-${PHOTO_METADATA[1]}
order: ${SRC_DIR}-${PHOTO_ORDER}
image: /images/photography/${SRC_DIR}/${PHOTO}
thumbnail: /images/photography/${SRC_DIR}/${PHOTO//.jpg/.thumb.jpg}
imageTitle: ${PHOTO_NAME//-/ }
---" >> ${PHOTO_FILENAME}
##### END FILENAME
        fi
    done
done
