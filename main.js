miro.onReady(() => {
  const icon24 = '<path fill="currentColor" fill-rule="nonzero" d="M20.156 7.762c-1.351-3.746-4.672-5.297-8.838-4.61-3.9.642-7.284 3.15-7.9 5.736-1.14 4.784-.015 7.031 2.627 8.09.61.244 1.28.412 2.002.518.277.041.549.072.844.097.138.012.576.045.659.053.109.01.198.02.291.035 1.609.263 2.664 1.334 3.146 2.715 7.24-2.435 9.4-6.453 7.17-12.634zm-18.684.662C3.18 1.256 18.297-3.284 22.038 7.084c2.806 7.78-.526 13.011-9.998 15.695-.266.076-.78.173-.759-.287.062-1.296-.47-2.626-1.762-2.837-1.009-.165-10.75.124-8.047-11.23zm9.427 4.113a6.853 6.853 0 0 0 1.787.172c.223.348.442.733.79 1.366.53.967.793 1.412 1.206 2a1 1 0 1 0 1.636-1.15c-.358-.51-.593-.908-1.09-1.812-.197-.36-.358-.649-.503-.899 1.16-.573 1.916-1.605 2.005-2.909.189-2.748-2.65-4.308-6.611-3.267-.443.117-.834.44-.886 1.408-.065 1.192-.12 2.028-.25 3.825-.129 1.808-.185 2.653-.25 3.86a1 1 0 0 0 1.997.108c.05-.913.093-1.617.17-2.702zm.144-2.026c.077-1.106.124-1.82.171-2.675 2.398-.483 3.595.257 3.521 1.332-.08 1.174-1.506 1.965-3.692 1.343z"/>'
  miro.initialize({
    extensionPoints: {
      bottomBar: {
        title: 'neural affinity mapper',
        svgIcon: icon24,
        onClick: () => {
          miro.board.selection.get().then( (widgets) => {
              if (widgets.length) {
                const processor = new WidgetsProcessor(widgets)
                processor.process()
              }
            }
          )
        }
      },
    }
  })
})

class WidgetsProcessor {
    constructor(widgets) {
        this.apiUrl = `https://edc276e15779.ngrok.io/get_clusters`
        this.widgets = []
        this.initX = widgets[0].x
        this.initY = widgets[0].y
        this.maxX = 0
        this.maxY = 0
        widgets.forEach(w => {  
            if (w.x < this.initX) {
                this.initX = w.x
            }
            if (w.y < this.initY) {
                this.initY = w.y
            }
            if (w.x > this.maxX) {
                this.maxX = w.x
            }
            if (w.y > this.maxY) {
                this.maxY = w.y
            }
            this.widgets.push({
                "id": w.id, 
                "plainText": w.plainText, 
                "x": w.x, "y": w.y,
                "width": w.bounds.width,
                "height": w.bounds.height,
            })
        })
        this.selectionWidth = this.maxX - this.initX
        this.selectionHeight = this.maxY - this.initY
    }

    process() {
        this.getWidgetClass().then((result) => {
            const data = result ? JSON.parse(result) : {}
            console.log(data)
            if (Object.keys(data).length) {
                this.updateWidgetsPos(data)
            }
        })
    }

    async getWidgetClass() {
        let resp = await fetch(this.apiUrl, {
            method: "POST",
            cache: 'no-cache',
            // credentials: "include",
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.widgets)  
        })
        return resp.text()
    }

    updateWidgetsPos(widgetClass) {
        Object.keys(widgetClass)
            .map(function(k) { return { key: k, value: languages[k] }; })
            .sort(function(a, b) { return b.value.length - a.value.length; });

        console.log(widgetClass)

        Object.entries(widgetClass).forEach(([key, value]) => {
            // just add the constant for now
            const newX = value.x + 50
            const newY = value.y + 50
            miro.board.widgets.update({
                id: value.id, 
                x: newX, y: newY
            })
        })
    }
}
