package com.jamajo.backend.DTO;

import java.util.List;

public class TmdbResponse {

    private List<TmdbImageRaw> backdrops;

    private List<TmdbImageRaw> stills;

    public List<TmdbImageRaw> getBackdrops() {
        return backdrops;
    }

    public void setBackdrops(List<TmdbImageRaw> backdrops) {
        this.backdrops = backdrops;
    }

    public List<TmdbImageRaw> getStills() {
        return stills;
    }

    public void setStills(List<TmdbImageRaw> stills) {
        this.stills = stills;
    }
}