document.addEventListener("DOMContentLoaded", function() {
    let observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let tweetElement = entry.target;
                let tweetURL = tweetElement.getAttribute('data-tweet-url');
                
                // Fetch the embedded tweet from Twitter's oEmbed API
                fetch(`https://publish.twitter.com/oembed?url=${tweetURL}`)
                .then(response => response.json())
                .then(data => {
                    tweetElement.outerHTML = data.html;
                })
                .catch(error => {
                    console.error('Error fetching the embedded tweet:', error);
                });

                // Stop observing this tweet
                observer.unobserve(tweetElement);
            }
        });
    });

    // Start observing all tweet placeholders
    document.querySelectorAll('.tweet-placeholder').forEach(tweet => {
        observer.observe(tweet);
    });
});
