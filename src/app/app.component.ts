import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { BehaviorSubject, interval, Subject, switchMap, tap, takeUntil, filter, fromEvent, buffer, debounceTime } from 'rxjs';
import { StopWatchState } from './models/StopWatchState.type';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

  @ViewChild('pauseBtn', { static: false })
  pauseButton!: MatButton;

  stopCount$ = new Subject();
  stateGoing$ = new BehaviorSubject(StopWatchState.STOPPED);
  StopWatchState = StopWatchState;
  currentTime$: BehaviorSubject<number> = new BehaviorSubject(0);
  
  title = 'secundomer';


  ngOnInit() {
    this.stateGoing$.pipe(
      untilDestroyed(this),
      filter(res => res === StopWatchState.GOING),
      switchMap(() => interval(1000).pipe(
        takeUntil(this.stopCount$),
        tap(_ => this.currentTime$.next(this.currentTime$.value + 1))
      ))
    ).subscribe();
  }

  ngAfterViewInit(): void {
    const pauseBtnClicks$ = fromEvent(this.pauseButton._getHostElement(), 'click');
    pauseBtnClicks$.pipe(
      untilDestroyed(this),
      buffer(pauseBtnClicks$.pipe(debounceTime(500))),
      filter(clicks => clicks.length >= 2),
      tap(_ => this.changeWatchState(StopWatchState.PAUSED))
    ).subscribe();
  }

  changeWatchState(state: StopWatchState) {
    switch (state) {
      case StopWatchState.STOPPED:
        this.currentTime$.next(0);
        this.stopCount$.next(true);
        break;
      case StopWatchState.PAUSED: 
        this.stopCount$.next(true); 
        break   
      default:
        break;
    }
    this.stateGoing$.next(state);
  }

  reset() {
    this.currentTime$.next(0);
  }

  toggleStartStop() {
    const currentValue = this.stateGoing$.value;
    if (currentValue !== StopWatchState.GOING) this.changeWatchState(StopWatchState.GOING);
    else this.changeWatchState(StopWatchState.STOPPED);
  }
}
