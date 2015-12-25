var cht2eng = require('./cht2eng');
export default function handlePromisePosition(pos){
  if(pos){
    if(pos === "不表態"){
        return "refuse";
    }else{
        return cht2eng(pos)
    }
  }else{
    return "none"
  }
  // because cht2eng doesn't handle ""
}