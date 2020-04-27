import React,{Component} from 'react';
import axios from 'axios';
import noImage from './../default.png';
import { Redirect } from 'react-router-dom';



class pokemonId extends Component{
    constructor(props){
        super(props);
        this.state={
            data:undefined
        };
    }
    async getAPIDATA(){
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${this.props.match.params.id}`);
        this.setState({
            data:response.data
        })
    }
    componentDidMount(){
        this.getAPIDATA();
    }
    displayData(){
    let data = this.state.data;
    const abilitiesArray = data.abilities.map((element, i) => {
        return <li key={i}>{element.ability.name}</li>
    });
    const formArray = data.forms.map((element, i) => {
        return <li key={i}>{element.name}</li>
    });
    const typeArray = data.types.map((element, i) => {
        return <li key={i}>{element.type.name}</li>
    });
    const statArray = data.stats.map((element, i) => {
        return <li key={i}>{element.stat.name}: {element.base_stat}</li>
    });

    let img = undefined;
    if (this.state.data.sprites.front_default) {
        img = <img alt="Pokemon" src={this.state.data.sprites.front_default} width="300" />;
    } else {
        img = <img alt="Pokemon" src={noImage} width="300" />
    }

    return (
        <article>
            <h1>{data.name}</h1>
            <div className = "row">
              <div className="col-4">
                {img}
              </div>
              <div className="col-8">
                <div className="mergin-right150">
                <h2>Abilities:</h2>
                <ul>{abilitiesArray}</ul>
                <h2>Base experience:</h2>
                <ul><li>{data.base_experience}</li></ul>
                <h2>Forms:</h2>
                <ul>{formArray}</ul>
                <h2>Height:</h2>
                <ul><li>{data.height}</li></ul>
                <h2>Species: </h2>
                <ul><li>{data.species.name}</li></ul>
                <h2>Base stat:</h2>
                <ul>{statArray}</ul>
                <h2>Type:</h2>
                <ul>{typeArray}</ul>
                <h2>Weight:</h2>
                <ul><li>{data.weight}</li></ul>
                </div>
              </div>
            </div>
            <br />
            <br />
            <br />
            <br />
        </article>
    );
    }
    render() {
    let body = null;

    if (this.state.data) {
      body = (
          <div className="App-body">
              {this.displayData()}
          </div>
      );
    }
    return body;
  }
}
export default pokemonId;
