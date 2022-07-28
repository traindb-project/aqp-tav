const dataSelectBtn = document.querySelector('.data-selector')
const section = document.querySelector('section')
const label = document.querySelector('label')

dataSelectBtn.addEventListener('click', function () {
    section.style.left = '0px';
    label.style.opacity = '0';
})

dataSelectBtn.addEventListener('blur', function () {
    section.style.left = '-200px';
    label.style.opacity = '1';
})

