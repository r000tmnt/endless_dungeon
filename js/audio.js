export default class Audio{
    constructor(source, type){
        const audio = document.createElement('audio')
        audio.src = source
        audio.muted = true
        // audio.classList.add('invisible')
        audio.classList.add('absolute')
        audio.style.zIndex = -1
        
        if(type === 'bg'){
            audio.addEventListener('canplaythrough', () => {
                console.log('canplaythrough')
                audio.muted = false
                audio.play().catch(e => {
                    window.addEventListener('click', () => {
                        console.log('play once')
                        audio.play()
                    }, { once: true })
                })
            })            
        }else{
            window.addEventListener("click", () => {
                audio.muted = false
                audio.play()
             });
        }

        return audio
    }
}