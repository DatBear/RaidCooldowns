import { Component } from 'react';
import ILoadable from '../models/ILoadable';
import { plainToClass } from 'class-transformer';

declare type ClassType<T> = {
  new (...args: any[]): T;
};

class BaseComponent<TProps, TState> extends Component<TProps, TState> {

  handleInputChange(property : string) {
    return (e: any) => {
        //console.log('prev state:', this.state);
        //console.log('property: ', property, 'value: ',e.target.value.toString());
        this.setState({
            [property]: e.target.value
        } as any);
    };
  }

  loadArray<T extends ILoadable>(key: string, type: ClassType<T>) {
    let parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    let classed = parsed.map((x: any) => plainToClass(type, x));
    classed.forEach((x: ILoadable) => x.loadChildren());
    return classed;
  }

  saveArray<T>(key: string, array: T[]){
    localStorage.setItem(key, JSON.stringify(array));
  }
}

export default BaseComponent;