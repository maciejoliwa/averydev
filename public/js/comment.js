const form = document.querySelector('form')

form.addEventListener('submit', e => {
    e.preventDefault();

    const username = form[0].value;
    const comment = form[1].value;
    const action = form.getAttribute('action');

    fetch(action, {
        method: 'POST',
        body: JSON.stringify({ username, comment, ArticleSlug: location.pathname.replace('/blog/', '') }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.status)
    .then(status => {
        if (status === 200) {
            console.log("OK!!!!!");
            location.reload();
        }
    })

});