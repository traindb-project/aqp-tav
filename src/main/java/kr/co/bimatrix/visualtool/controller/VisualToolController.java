package kr.co.bimatrix.visualtool.controller;

import kr.co.bimatrix.visualtool.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class VisualToolController {

    @Autowired
    SqlMesRepository sqlMesRepository;

    @Autowired
    SqlGisRepository sqlGisRepository;

    @Autowired
    SqlSimRepository sqlSimRepository;

    @Autowired
    AqpMesRepository aqpMesRepository;

    @Autowired
    AqpGisRepository aqpGisRepository;

    @Autowired
    AqpSimRepository aqpSimRepository;

    @Autowired
    CmpMesRepository cmpMesRepository;

    @Autowired
    CmpGisRepository cmpGisRepository;

    @Autowired
    CmpSimRepository cmpSimRepository;

    @GetMapping("/")
    public String home() {
        return "home";
    }

    @GetMapping("visual-tool")
    public String visualTool() {
        return "visual-tool";
    }

    @GetMapping("grid")
    public String grid(@RequestParam("mode") String mode, Model model) {
        Object domainDataList = switch (mode) {
            case "sql-mes" -> sqlMesRepository.findAll();
            case "sql-gis" -> sqlGisRepository.findAll();
            case "sql-sim" -> sqlSimRepository.findAll();
            case "aqp-mes" -> aqpMesRepository.findAll();
            case "aqp-gis" -> aqpGisRepository.findAll();
            case "aqp-sim" -> aqpSimRepository.findAll();
            case "cmp-mes" -> cmpMesRepository.findAll();
            case "cmp-gis" -> cmpGisRepository.findAll();
            case "cmp-sim" -> cmpSimRepository.findAll();
            default -> null;
        };

        model.addAttribute("domainDataList", domainDataList);
        return "grid";
    }

    @GetMapping("visuals")
    public String visuals(Model model) {
        return "visuals";
    }

}
