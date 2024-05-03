const lists = document.querySelectorAll('li')

lists.forEach((li) => {
    li.addEventListener('mouseover', (e) => {
        li.classList.add('focus')
    })
    li.addEventListener('mouseout', (e) => {
        li.classList.remove('focus')
    })
})

const btnToggle = document.querySelector('.btn-toggle')
const rightNav = document.querySelector('.right-nav')

btnToggle.addEventListener('click', () => {
    rightNav.classList.toggle('show-nav')
    btnToggle.classList.toggle('active')
})