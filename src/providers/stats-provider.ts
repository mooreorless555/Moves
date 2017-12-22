import { Injectable } from '@angular/core';
import { DatabaseProvider } from '../providers/database-provider';
import { LocationTracker } from '../providers/location-tracker';

declare var ProgressBar: any;

@Injectable()
export class StatsProvider {

  public counters = [];
  public cnum = 0;
  public flowDirection = "none";
  public isAnimating = false;

constructor(public db: DatabaseProvider, public lt: LocationTracker) {

}

  CreatePeopleCounter(key, value) {
    console.log("Creating Counter at container: " + key);
    var counter = new ProgressBar.SemiCircle('#ctn_' + key, {
      strokeWidth: 18,
      easing: 'easeInOut',
      duration: 1400,
      color: '#9932CC',
      svgStyle: null,

      text: {
        value: '',
        className: "progressbar__label",
      },

      from: { color: '#9932CC' },
      to: { color: '#DCD6F4' },

      step: (state, bar) => {
        bar.path.setAttribute('stroke', state.color);
      }
    });

    counter.text.style.fontFamily = 'AppFont';
    counter.text.style.fontSize = '1.4rem';
    counter.text.style.top = '40px';

    counter.set((Math.random()+0.3) % 1);
    setTimeout(() => counter.animate(value > 1 ? 1 : value), 700);
    this.cnum++;
    // console.log(this.counters);
    // return counter;
  }

  RemoveCounter(myKey) {
    let c = this.counters;
    for (let i = 0; i < this.counters.length; i++) {
      if (c[i].key == myKey) {
        c[i].c.destroy();
        c.splice(i, 1);
      }
    }
  }

  CounterExists(myKey) {
    for (let c of this.counters) {
      if (c.key == myKey) {
        return true;
      }
    }
    return false;
  }

  CreateStatsCounter(container, move) {

    console.log("Creating Counter");

    var counter = new ProgressBar.SemiCircle(container.nativeElement, {
      strokeWidth: 18,
      easing: 'easeInOut',
      duration: 2300,
      color: '#9932CC',
      svgStyle: null,

      text: {
        value: '',
        className: 'progressbar__label',
      },

      // from: { color: '#9932CC' },
      from: { color: '#efd6ff' },
      to: { color: '#FFFFFF' },

      step: (state, bar) => {
        bar.path.setAttribute('stroke', state.color);
        let numppl = Math.round(bar.value() * move.info.capacity);
        if (bar.value() >= 1) {
          this.db.get('value', 'moves/'+this.lt.currentCollege.key+'/'+move.key+'/users/').then(users => {
            bar.setText(Object.keys(users).length);
            bar.path.setAttribute('stroke', '#fc6161');
          })
        } else {
          bar.setText(numppl)
        }
        bar.text.style.color = state.color;
        bar.text.style.fontSize = 2 + bar.value()*2.3 + 'rem';
      }
    });

    counter.text.style.fontFamily = 'Lato';
    counter.text.style.fontSize = '2rem';
    console.log(counter);

    var perc = 0;

    if (perc > 1) {
      counter.animate(1);
    } else if (perc >= 0) {
      counter.animate(perc);
    } else {
      counter.animate(0);
    }

    return counter;

  }

  CreateGeneralCounter(container, type, color, duration, move, overflow, name) {
    var num = 0;
    if (type == 'line') {
      var counter = new ProgressBar.Line(container.nativeElement, {
        name: name,
        strokeWidth: 6,
        easing: 'easeInOut',
        duration: duration,
        color: color,
        svgStyle: { width: '130px', height: '30px' },
        text: {
          position: 'relative',
          // top: '0px',
          bottom: '60px',
          padding: 0,
          margin: 0,
          transform: null
        },
        step: (state, bar) => {

          num = bar.value() * move.info.capacity;
          // overflow = num;
          if (bar.value() >= 1) {
          this.db.get('value', 'moves/'+this.lt.currentCollege.key+'/'+move.key+'/stats/'+name).then(stats => {
            bar.setText(stats);
          })
          } else {
            bar.setText(num.toFixed(0));
          }

          bar.text.style.color = state.color;
          // bar.text.style.left = 10 + (bar.value() * 90) + '%';
          bar.text.style.left = 20 + (bar.value() * 95) + '%';
          
        }
      });

      // counter.text.style.fontFamily = 'AppFont';
      counter.text.style.fontFamily = 'AppFont';
      counter.text.style.fontSize = '1.6rem';
      counter.text.style.bottom = '-15px';



      counter.animate(1);
      return counter;
    }

    return -1;

  }

  /*iOS*/
  CreateGeneralCounter_iOS(container, type, color, duration, move, overflow, name) {
    var num = 0;
    if (type == 'line') {
      var counter = new ProgressBar.Line(container.nativeElement, {
        name: name,
        strokeWidth: 12,
        easing: 'easeInOut',
        duration: duration,
        color: color,
        svgStyle: { width: '130px', height: '35px' },
        text: {
          position: 'relative',
          // top: '100px',
          // bottom: '60px',
          padding: 0,
          margin: 0,
          transform: null
        },
        step: (state, bar) => {

          num = bar.value() * move.info.capacity;
          // overflow = num;
          if (bar.value() >= 1) {
          this.db.get('value', 'moves/'+this.lt.currentCollege.key+'/'+move.key+'/stats/'+name).then(stats => {
            bar.setText(stats);
          })
          } else {
            bar.setText(num.toFixed(0));
          }

          bar.text.style.color = state.color;
          // bar.text.style.left = 10 + (bar.value() * 90) + '%';
          bar.text.style.left = 20 + (bar.value() * 95) + '%';
          
        }
      });

      // counter.text.style.fontFamily = 'AppFont';
      counter.text.style.fontFamily = 'AppFont';
      counter.text.style.fontSize = '1.6rem';
      counter.text.style.bottom = '-30px';



      counter.animate(1);
      return counter;
    }

    return -1;

  }



  CreateSmallLineCounter(container, color, duration, value) {
    var num = 0
var counter = new ProgressBar.Line('#ctn_' + container, {
        strokeWidth: 2,
        duration: duration,
        easing: 'easeInOut',
        color: color,
        svgStyle: { width: '90%', height: '3%' },
        text: {
          position: 'relative',
          // top: '0px',
          bottom: '60px',
          padding: 0,
          margin: 0,
          transform: null
        },
        step: (state, bar) => {
          num = bar.value() * value;  
        }
      });



      counter.animate(value);
      return counter;
    }    

  GetCounter(myKey) {
    for (let c of this.counters) {
      if (c.key == myKey) {
        let idx = this.counters.indexOf(c);
        console.log('FOUND, here: ', idx);
        return idx;
      }
    }
    return null;
  }

  UpdateCounter(counter, value, displayValue?:number) {
    counter.animate(value > 1 ? 1 : value);
    if (value > 1 && displayValue) {
      setTimeout(() => {
        counter.text.innerHTML = displayValue;}, 2000)
    }
  }

  UpdateCounter_key(key, value) {
    let counter = $('#ctn_' + key);
    console.log(counter);
    counter.animate(value > 1 ? 1 : value);
  }

  ResetCounters() {
    this.counters = [];
  }

  between(x, min, max) {
    return x >= min && x <= max;
  }

  calculateFlow(flowObj) {
    var flow = {
      net: 0,
      in: 0,
      out: 0
    }

    var objLength = 0;
    var flowObjArray = []
    if (flowObj) objLength = Object.keys(flowObj).length;

    if (objLength >= 10) {
      for (var pushId in flowObj) {
        flowObjArray.push(flowObj[pushId])
      }

      for (var i = flowObjArray.length - 10; i < flowObjArray.length; i++) {
        flow.in += flowObjArray[i].in;
        flow.out += flowObjArray[i].out;
      }

      flow.net = flow.in - flow.out;
    }

    if (flow.net > 0) {
      this.flowDirection = "up";
      this.flipElement('#flow', 'up_arrow.png')
    } else if (flow.net < 0) {
      this.flowDirection = "down";
      this.flipElement('#flow', 'down_arrow.png')
    } else {
      this.flowDirection = "none";
      this.flipElement('#flow', 'no_arrow.png')
    }

    return flow;
  }

  startAnimating() {
    this.isAnimating = true;
  }

  flipElement(elementId, newImage) {
    var newImageStr = "assets/img/"+newImage;
      if ($(elementId).find('img').attr("src") != newImageStr) {
          // $(elementId).velocity('transition.flipBounceYOut', { duration: 2000 })
          // .velocity('transition.flipBounceYIn', { duration: 2000 })
          // setTimeout(() => {
            $(elementId).find('img').attr("src", newImageStr);
          // }, 2000)
      }
    }

    animateValue(object, prop, number) {
      anime({
        targets: object,
        [prop]: number, // Animate the 'prop1' property from myObject to 50
        round: 1
      });
    }


}