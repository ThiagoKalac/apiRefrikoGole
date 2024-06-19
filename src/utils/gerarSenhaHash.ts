import  bcrypt  from  "bcrypt" 
import "dotenv/config"

const gerarSalt = () => {
    const saltOpcoes = [8,10,12];
    const indexAleatorio = Math.floor(Math.random() * saltOpcoes.length)
    return saltOpcoes[indexAleatorio];
}

const gerarSenhaHash = async (senha:string):Promise<string> => {
    const numeroSalt = gerarSalt();
    const salt = await bcrypt.genSalt(numeroSalt);
    const senhaHash = await bcrypt.hash(senha + process.env.Bcrypt_Chave, salt)
    return senhaHash
}


export {gerarSenhaHash};