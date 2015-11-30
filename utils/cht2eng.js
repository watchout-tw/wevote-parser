var clc = require('cli-color')
export default function cht_to_eng(cht){
try{
	switch(cht){
		case '中國國民黨':
			return 'KMT';
		case '國民黨':
			return 'KMT';
		case '民主進步黨':
			return 'DPP';
		case '民進黨':
			return 'DPP';
		case '台聯':
			return 'TSU';
		case '台灣團結聯盟':
			return 'TSU';
		case '親民黨':
			return 'PFP';
		case '民國黨':
			return 'MKT';
		case '無黨團結聯盟':
		 	return 'NSU';
		case '時代力量':
			return 'NPP';
		case '綠黨社會民主黨聯盟':
			return 'GSD';
		case '新黨':
			return 'NP';
		case '軍公教聯盟黨':
			return 'MCFAP';
		case '樹黨':
			return 'TP';
		case '台灣獨立黨':
			return 'TIP';
		case '信心希望聯盟':
			return 'FHL';
		case '和平鴿聯盟黨':
			return 'PPU';
		case '中華民國機車黨':
			return 'MPR';
		case '自由台灣黨':
			return 'FTP';
		case '大愛憲改聯盟':
            return 'DASG';
        case '中華統一促進黨':
            return 'CHTY';
        case '健保免費連線':
            return 'NHSA';
		case '無黨':
			return 'NONE';
		case '無黨籍':
			return 'NONE';

		case '贊成':
	    	return 'aye';
	    case '反對':
	    	return 'nay';
	    case '模糊':
	    	return 'unknown';
	    case '沒資料':
	    	return 'none';
	    case '？':
	    	return 'none';

	    case '公開透明':
	    	return 'transparent';
	    case '黑箱':
	    	return 'blackbox';

	    case '婚姻平權':
	    	return 'marriageEquality';
	    case '罷免':
	    	return 'recall';
	    case '公投':
	    	return 'referendum';
	    case '核能':
	    	return 'nuclearPower';
	   
		default: 
			throw new Error("找不到這個詞的英文:"+cht);

	}
}catch(e){
		console.log(clc.red(e));
		process.exit(1);
}


}