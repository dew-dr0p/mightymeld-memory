import { useState, useEffect } from 'react'

export default function CustomProgressBar({ onReset, timer, end }) {
    const [progress, setProgress] = useState(100)

    useEffect(() => {
        setInterval(() => {
            setProgress((prevProgress) => Math.max((prevProgress - 1), 0))
        }, (timer * 10))
    }, [timer])

    useEffect(() => {
        if (progress === 0) {
            end()
        }
    }, [progress])

    useEffect(() => {
        if (onReset) {
            reset()
        }
    }, [onReset])

    const reset = () => {
        setProgress(100)
    }

    const getGradientColor = (progress) => {
        const green = [0, 155, 0] // RGB for Green
        const red = [155, 0, 0] // RGB for Red
        const percent = progress / 100
        const result = red.map((colorValue, index) => {
            return Math.round(colorValue + (green[index] - colorValue) * percent)
        })
        return `rgb(${result.join(',')})`
    }

    const containerStyles = {
        height: 20,
        width: '100%',
        background: '#e0e0de',
        borderRadius: 50
    }

    const fillerStyles = {
        height: '100%',
        width: `${progress}%`,
        borderRadius: 'inherit',
        background: getGradientColor(progress)
    }


  return (
    <div style={containerStyles}>
        <div style={fillerStyles}>

        </div>
    </div>
  )
}
